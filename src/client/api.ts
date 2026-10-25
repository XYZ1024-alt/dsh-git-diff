/**
 * Browser adapter over the Host routes: every response is parsed against the
 * shared contract here, so components only see contract types.
 */
import type { Key } from 'swr'
import type { z } from 'zod'
import { ApiError, GitDiff, GitStatus } from '../contract.ts'
import { ROUTES } from '../routes.ts'

/** Error text of a failed response: the contract's JSON error, or the plain body a lower layer answered with. */
async function failureOf(response: Response): Promise<Error> {
  const fallback = `HTTP ${response.status}`
  if (response.headers.get('content-type')?.includes('application/json')) {
    return new Error(ApiError.safeParse(await response.json()).data?.error ?? fallback)
  }
  const text = (await response.text()).trim()
  return new Error(text === '' ? fallback : `${fallback} ${text}`)
}

async function getJson<T extends z.ZodType>(schema: T, route: keyof typeof ROUTES, params: Record<string, string>): Promise<z.infer<T>> {
  const response = await fetch(`${ROUTES[route]}?${new URLSearchParams(params)}`, { cache: 'no-store', credentials: 'same-origin' })
  if (!response.ok) throw await failureOf(response)
  return schema.parse(await response.json())
}

/** SWR key of a Session's status. */
export const statusKey = (sessionId: string) => ['dsh-git-diff/status', sessionId] as const

/** SWR key of one path's diff. */
export const diffKey = (sessionId: string, path: string) => ['dsh-git-diff/diff', sessionId, path] as const

/** Whether an SWR key belongs to the given Session. */
export const isSessionKey = (sessionId: string) => (key: Key) => Array.isArray(key) && String(key[0]).startsWith('dsh-git-diff/') && key[1] === sessionId

export const fetchStatus = ([, session]: ReturnType<typeof statusKey>) => getJson(GitStatus, 'status', { session })

export const fetchDiff = ([, session, path]: ReturnType<typeof diffKey>) => getJson(GitDiff, 'diff', { session, path })
