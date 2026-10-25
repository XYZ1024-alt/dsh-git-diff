/**
 * dsh-git-diff, Host half: read-only git routes for the right-Sidebar
 * "Git changes" tab. The routes are exact Fetch routes on the shared `/api`
 * channel, so Connection applies its Host/Origin trust checks and owner
 * authentication before a request arrives here. Every request names a Session;
 * that Session's working directory is the only directory it can reach, and
 * only paths git reports as changed can be read.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { ApiError, GitDiff, GitStatus } from '../contract.ts'
import { ROUTES } from '../routes.ts'
import { readDiff, readStatus } from './git.ts'

export const name = 'dsh-git-diff'

export const inject = ['connection', 'sessions', 'fs', 'subprocess']

const json = (status: number, body: GitStatus | GitDiff | ApiError) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } })

const failure = (status: number, error: string) => json(status, { error })

/** Working directory of a live or stored Session; `undefined` for an unknown id. */
async function sessionCwd(ctx: Context, id: string): Promise<string | undefined> {
  // The wire carries the plain id; branding happens at this one boundary.
  const sessionId = id as SessionId
  const header = ctx.sessions.get(sessionId)?.header ?? (await ctx.get('sessionPersistence')?.stat(sessionId))?.header
  return header?.cwd
}

type Handler = (ctx: Context, cwd: string, params: URLSearchParams, signal: AbortSignal) => Promise<Response>

const status: Handler = async (ctx, cwd, _params, signal) => json(200, await readStatus(ctx, cwd, signal))

const diff: Handler = async (ctx, cwd, params, signal) => {
  const path = params.get('path')
  if (!path) return failure(400, 'Missing "path" parameter')
  const current = await readStatus(ctx, cwd, signal)
  if (!current.repository) return failure(409, 'The workspace is not a git repository')
  const change = current.changes.find((entry) => entry.path === path)
  if (change === undefined) return failure(404, `"${path}" has no working-tree change`)
  const root = await ctx.fs.resolve(current.root, { signal })
  const target = await ctx.fs.resolve(change.path, { cwd: current.root, signal })
  if (!ctx.fs.contains(root, target)) return failure(403, `"${path}" is outside the repository`)
  return json(200, await readDiff(ctx, root, target, change.from ?? change.path, signal))
}

/** Resolve the request's Session, run the handler, and turn failures into JSON errors. */
async function serve(ctx: Context, handler: Handler, request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const sessionId = params.get('session')
  if (!sessionId) return failure(400, 'Missing "session" parameter')
  try {
    const cwd = await sessionCwd(ctx, sessionId)
    if (cwd === undefined) return failure(404, `Session "${sessionId}" has no working directory`)
    return await handler(ctx, cwd, params, request.signal)
  } catch (error) {
    ctx.logger.warn('dsh-git-diff: %s failed: %o', request.url, error)
    return failure(500, error instanceof Error ? error.message : String(error))
  }
}

/**
 * Register the status and diff routes.
 * @param ctx - Host context.
 */
export function apply(ctx: Context): void {
  for (const [route, handler] of [
    [ROUTES.status, status],
    [ROUTES.diff, diff],
  ] as const) {
    ctx.effect(
      () => ctx.connection.fetch.register({ path: route, methods: ['GET'], requestBody: 'buffered', fetch: (request) => serve(ctx, handler, request) }),
      `dsh-git-diff: ${route}`,
    )
  }
}
