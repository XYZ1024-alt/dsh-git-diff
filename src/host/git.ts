/**
 * Git adapter: runs git through the Host's subprocess service and folds its
 * porcelain output into the wire contract.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { FsTarget } from '@deepseek-ai/dsh-fs'
import type { ChangeKind, GitChange, GitDiff, GitStatus } from '../contract.ts'

/** Largest side of a comparison the tab renders. */
const MAX_TEXT_BYTES = 512 * 1024

/** Collected stdout cap; larger output fails instead of being parsed from a truncated tail. */
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024

const GIT_ENV = { GIT_OPTIONAL_LOCKS: '0', GIT_PAGER: 'cat', LANG: 'C', LC_ALL: 'C', NO_COLOR: '1', TERM: 'dumb' }

interface GitResult {
  exitCode: number | null
  stdout: string
  truncated: boolean
  stderr: string
}

async function git(ctx: Context, cwd: string, args: readonly string[], signal: AbortSignal): Promise<GitResult> {
  const executable = await ctx.subprocess.resolveExecutable('git', undefined, signal)
  const handle = ctx.subprocess.spawn({
    argv: [executable, ...args],
    cwd,
    stdio: {
      stdin: 'ignore',
      stdout: { maxBytes: MAX_OUTPUT_BYTES },
      stderr: { maxBytes: 64 * 1024 },
    },
    env: GIT_ENV,
    graceMs: 2000,
    signal,
  })
  const { exitCode } = await handle.done
  const stdout = handle.collected.stdout?.readFrom(0)
  const stderr = handle.collected.stderr?.readFrom(0)
  return { exitCode, stdout: stdout?.text ?? '', truncated: stdout?.lossy ?? false, stderr: stderr?.text.trim() ?? '' }
}

async function gitOk(ctx: Context, cwd: string, args: readonly string[], signal: AbortSignal): Promise<string> {
  const result = await git(ctx, cwd, args, signal)
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr || `exit ${result.exitCode}`}`)
  if (result.truncated) throw new Error(`git ${args[0]} printed more than ${MAX_OUTPUT_BYTES} bytes`)
  return result.stdout
}

function kindOf(code: string): ChangeKind {
  const [x = ' ', y = ' '] = code
  if (code === '??') return 'untracked'
  if (x === 'U' || y === 'U' || code === 'AA' || code === 'DD') return 'conflicted'
  if (x === 'R') return 'renamed'
  if (x === 'C') return 'copied'
  switch (y === ' ' ? x : y) {
    case 'A':
      return 'added'
    case 'D':
      return 'deleted'
    case 'T':
      return 'typechange'
    default:
      return 'modified'
  }
}

/**
 * Parse `git status --porcelain=v1 -z`: `XY path\0`, where a rename or copy
 * is followed by its source path as the next record.
 */
function parseStatus(output: string): GitChange[] {
  const records = output.split('\0')
  const changes: GitChange[] = []
  for (let index = 0; index < records.length; index++) {
    const record = records[index] ?? ''
    if (record.length < 4) continue
    const code = record.slice(0, 2)
    const kind = kindOf(code)
    const change: GitChange = { path: record.slice(3), kind, staged: code[0] !== ' ' && code[0] !== '?' }
    if (kind === 'renamed' || kind === 'copied') {
      index++
      change.from = records[index]
    }
    changes.push(change)
  }
  return changes.sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Read the working-tree status of the repository containing `cwd`.
 * @param ctx - Host context carrying `subprocess`.
 * @param cwd - the Session's working directory.
 * @param signal - request lifetime.
 */
export async function readStatus(ctx: Context, cwd: string, signal: AbortSignal): Promise<GitStatus> {
  const top = await git(ctx, cwd, ['rev-parse', '--show-toplevel'], signal)
  if (top.exitCode !== 0) return { repository: false }
  const root = top.stdout.trim()
  const [branch, status] = await Promise.all([
    gitOk(ctx, root, ['branch', '--show-current'], signal),
    gitOk(ctx, root, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], signal),
  ])
  return { repository: true, root, branch: branch.trim() || null, changes: parseStatus(status) }
}

const isBinary = (text: string) => text.includes('\0')

/**
 * Compare one path's `HEAD` content with its working-tree content.
 * @param ctx - Host context carrying `subprocess` and `fs`.
 * @param root - repository root resolved by {@link readStatus}.
 * @param path - changed path relative to `root`.
 * @param from - source path of a rename or copy.
 * @param signal - request lifetime.
 */
export async function readDiff(ctx: Context, root: FsTarget, path: FsTarget, from: string, signal: AbortSignal): Promise<GitDiff> {
  const cwd = ctx.fs.processPath(root)
  const head = await git(ctx, cwd, ['show', `HEAD:./${from}`], signal)
  const oldText = head.exitCode === 0 ? head.stdout : null
  if (head.truncated || head.stdout.length > MAX_TEXT_BYTES) return { kind: 'too-large' }
  if (oldText !== null && isBinary(oldText)) return { kind: 'binary' }

  const info = await ctx.fs.stat(path, signal)
  if (info === undefined) return { kind: 'text', oldText, newText: '' }
  if (info.type !== 'file') return { kind: 'binary' }
  if ((info.size ?? 0) > MAX_TEXT_BYTES) return { kind: 'too-large' }
  const newText = await ctx.fs.readText(path, signal).catch(() => undefined)
  if (newText === undefined || isBinary(newText)) return { kind: 'binary' }
  return { kind: 'text', oldText, newText }
}
