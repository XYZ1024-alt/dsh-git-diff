/**
 * Wire contract between the Host routes and the browser tab. The schemas are
 * the single definition of every response shape: the Host builds values of
 * these types and the browser parses incoming JSON with them.
 */
import { z } from 'zod'

/** How one path differs from `HEAD`, folded from git's two-letter porcelain code. */
export const ChangeKind = z.enum(['modified', 'added', 'deleted', 'renamed', 'copied', 'typechange', 'untracked', 'conflicted'])
export type ChangeKind = z.infer<typeof ChangeKind>

/** One changed path, relative to the repository root. */
export const GitChange = z.object({
  path: z.string(),
  /** Source path of a rename or copy. */
  from: z.string().optional(),
  kind: ChangeKind,
  /** Whether part of the change is already in the index. */
  staged: z.boolean(),
})
export type GitChange = z.infer<typeof GitChange>

/** Working-tree status of the Session's workspace. */
export const GitStatus = z.discriminatedUnion('repository', [
  z.object({ repository: z.literal(false) }),
  z.object({
    repository: z.literal(true),
    /** Absolute repository root on the Host. */
    root: z.string(),
    /** Current branch; `null` on a detached HEAD. */
    branch: z.string().nullable(),
    changes: z.array(GitChange),
  }),
])
export type GitStatus = z.infer<typeof GitStatus>

/** `HEAD` versus working-tree content of one changed path. */
export const GitDiff = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    /** `null` when the path does not exist in `HEAD`. */
    oldText: z.string().nullable(),
    /** Empty when the path no longer exists in the working tree. */
    newText: z.string(),
  }),
  z.object({ kind: z.literal('binary') }),
  z.object({ kind: z.literal('too-large') }),
])
export type GitDiff = z.infer<typeof GitDiff>

/** Body of every non-2xx response. */
export const ApiError = z.object({ error: z.string() })
export type ApiError = z.infer<typeof ApiError>
