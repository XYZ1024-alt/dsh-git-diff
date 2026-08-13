/**
 * dsh-side-panel — node half. Filesystem + git primitives for the browser
 * half, served over the webServer route registry under /dev-panel/*.
 * GET-only, JSON responses shaped { ok: true, ... } | { ok: false, ... }.
 */

const TEXT_EXTS = new Set([
  '.txt','.md','.markdown','.json','.jsonc','.yaml','.yml','.toml','.ini','.cfg','.conf','.env',
  '.js','.mjs','.cjs','.jsx','.ts','.tsx','.mts','.cts','.css','.scss','.sass','.less','.html','.htm','.xml','.svg',
  '.py','.rb','.go','.rs','.java','.kt','.kts','.c','.h','.cpp','.hpp','.cc','.cxx','.cs','.swift','.scala','.php','.lua','.r','.pl','.pm','.sh','.bash','.zsh','.fish','.ps1','.bat','.cmd',
  '.sql','.graphql','.gql','.proto','.vue','.svelte','.astro','.log','.csv','.tsv','.diff','.patch','.prisma',
  '.dart','.ex','.exs','.erl','.hrl','.hs','.ml','.mli','.nim','.zig','.tf','.hcl','.gradle','.properties','.rst','.adoc','.tex','.nix','.cmake',
])
const BINARY_EXTS = new Set([
  '.png','.jpg','.jpeg','.gif','.webp','.ico','.bmp','.avif','.pdf','.zip','.gz','.tgz','.tar','.7z','.rar',
  '.exe','.dll','.so','.dylib','.bin','.woff','.woff2','.ttf','.otf','.eot',
  '.mp3','.mp4','.mov','.avi','.mkv','.wav','.flac','.wasm','.o','.a','.obj','.class','.jar','.war','.pyc','.pdb','.db','.sqlite','.sqlite3','.node',
])
const CAP = 524288

export const inject = ['webServer', 'fs', 'subprocess']

function send(res, body, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function fail(e) {
  return { ok: false, error: String((e && e.message) || e) }
}

function classify(name) {
  const lower = String(name || '').toLowerCase()
  const dot = lower.lastIndexOf('.')
  const ext = dot > 0 ? lower.slice(dot) : ''
  if (ext !== '' && TEXT_EXTS.has(ext)) return 'text'
  if (ext !== '' && BINARY_EXTS.has(ext)) return 'binary'
  return 'unknown'
}

async function listFiles(ctx, dir) {
  if (typeof dir !== 'string' || dir === '') return { ok: false, error: 'no directory' }
  const target = await ctx.fs.resolve(dir)
  const entries = await ctx.fs.listDir(target)
  const dirs = []
  const files = []
  for (const e of entries) {
    const item = { name: e.name, type: e.type, path: ctx.fs.processPath(e.target) }
    if (e.type === 'directory') dirs.push(item)
    else files.push(item)
  }
  const cmp = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
  dirs.sort(cmp)
  files.sort(cmp)
  return { ok: true, dir: ctx.fs.processPath(target), dirs, files }
}

async function readFile(ctx, path) {
  if (typeof path !== 'string' || path === '') return { ok: false, error: 'no path' }
  const name = String(path).replace(/[\\/]+$/, '').split(/[\\/]/).pop() || path
  const cls = classify(name)
  if (cls === 'binary') return { ok: false, reason: 'unsupported', message: 'Unsupported file format' }
  const target = await ctx.fs.resolve(path)
  const info = await ctx.fs.stat(target)
  if (info === undefined || info.type !== 'file') return { ok: false, reason: 'unsupported', message: 'Not a readable file' }
  if (typeof info.size === 'number' && info.size > CAP) {
    return { ok: false, reason: 'too-large', message: `File too large to preview (${Math.round(info.size / 1024)} KB)` }
  }
  try {
    const content = await ctx.fs.readText(target)
    return { ok: true, name, path, content }
  } catch (e) {
    return { ok: false, reason: 'unsupported', message: 'Unsupported file format (binary or undecodable)' }
  }
}

async function runGit(ctx, dir, args) {
  let exe = 'git'
  try { exe = await ctx.subprocess.resolveExecutable('git') } catch (e) { exe = 'git' }
  const handle = ctx.subprocess.spawn({
    argv: [exe].concat(args),
    cwd: dir,
    stdio: {
      stdin: 'ignore',
      stdout: { maxBytes: 4194304, spill: { maxBytes: 16777216 } },
      stderr: { maxBytes: 262144, spill: { maxBytes: 4194304 } },
    },
    graceMs: 3000,
    env: { NO_COLOR: '1', TERM: 'dumb', GIT_PAGER: 'cat', PAGER: 'cat', LANG: 'C' },
  })
  let outcome
  try { outcome = await handle.done } catch (e) { return { ok: false, error: `git spawn failed: ${String((e && e.message) || e)}` } }
  const stdout = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : ''
  const stderr = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : ''
  return { ok: true, exitCode: outcome.exitCode, stdout, stderr }
}

function letter(code) {
  const x = code.charAt(0)
  const y = code.charAt(1)
  if (code === '??') return 'U'
  if (code === '!!') return null
  if (x === 'R' || y === 'R') return 'R'
  if (x === 'C' || y === 'C') return 'C'
  if (x === 'U' || y === 'U') return 'U'
  const c = (y !== ' ' && y !== '?') ? y : x
  if (c === 'M') return 'M'
  if (c === 'A') return 'A'
  if (c === 'D') return 'D'
  return c === ' ' ? null : c
}

async function gitStatus(ctx, dir) {
  if (typeof dir !== 'string' || dir === '') return { ok: false, error: 'no directory' }
  const r = await runGit(ctx, dir, ['status', '--porcelain'])
  if (r.ok === false) return r
  if (r.exitCode !== 0) {
    const chk = await runGit(ctx, dir, ['rev-parse', '--is-inside-work-tree'])
    const inside = chk.ok !== false && chk.exitCode === 0 && String(chk.stdout).trim() === 'true'
    if (!inside) return { ok: true, repo: false, entries: [], message: 'Not a git repository' }
    return { ok: false, error: r.stderr || 'git status failed' }
  }
  const lines = String(r.stdout).split(/\r?\n/)
  const entries = []
  for (const line of lines) {
    if (line.length < 4) continue
    const code = line.slice(0, 2)
    const rest = line.slice(3)
    const lt = letter(code)
    if (lt === null) continue
    let p = rest
    if (lt === 'R' || lt === 'C') {
      const idx = rest.indexOf(' -> ')
      if (idx >= 0) p = rest.slice(idx + 4)
    }
    entries.push({ status: lt, path: p })
  }
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  let branch = null
  const br = await runGit(ctx, dir, ['rev-parse', '--abbrev-ref', 'HEAD'])
  if (br.ok !== false && br.exitCode === 0) branch = String(br.stdout).trim() || null
  return { ok: true, repo: true, branch, entries }
}

async function gitDiff(ctx, dir, path, status) {
  if (typeof dir !== 'string' || dir === '') return { ok: false, error: 'no directory' }
  if (typeof path !== 'string' || path === '') return { ok: false, error: 'no path' }
  if (status === 'U') {
    try {
      const target = await ctx.fs.resolve(path)
      const content = await ctx.fs.readText(target)
      const lines = content.split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) lines[i] = `+${lines[i]}`
      return {
        ok: true,
        kind: 'untracked',
        header: `New file: ${path}`,
        diff: `diff --git a/${path} b/${path}\nnew file mode 100644\n--- /dev/null\n+++ b/${path}\n${lines.join('\n')}`,
      }
    } catch (e) {
      return { ok: false, error: `Cannot preview untracked file: ${String((e && e.message) || e)}` }
    }
  }
  const r = await runGit(ctx, dir, ['diff', 'HEAD', '--', path])
  if (r.ok === false) return r
  if (r.exitCode !== 0) return { ok: false, error: r.stderr || 'git diff failed' }
  const diff = r.stdout
  if (String(diff).trim() === '') return { ok: true, kind: 'diff', header: path, diff: '(no changes vs HEAD)' }
  return { ok: true, kind: 'diff', header: path, diff }
}

export function apply(ctx) {
  ctx.effect(
    () => ctx.webServer.register({
      kind: 'prefix',
      path: '/dev-panel',
      handler: async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://x')
        const name = url.pathname.slice('/dev-panel'.length)
        const q = url.searchParams
        try {
          if (name === '/list-files') {
            send(res, await listFiles(ctx, q.get('dir')))
          } else if (name === '/read-file') {
            send(res, await readFile(ctx, q.get('path')))
          } else if (name === '/git-status') {
            send(res, await gitStatus(ctx, q.get('dir')))
          } else if (name === '/git-diff') {
            send(res, await gitDiff(ctx, q.get('dir'), q.get('path'), q.get('status')))
          } else {
            send(res, { ok: false, error: 'not found' }, 404)
          }
        } catch (e) {
          send(res, fail(e), 500)
        }
      },
    }),
    'dsh-side-panel: routes',
  )
}
