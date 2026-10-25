/**
 * Exact Host routes on the shared `/api` channel. Connection matches exact
 * Fetch routes against the full request pathname, so each path includes `/api`.
 */
export const ROUTES = { status: '/api/dsh-git-diff/status', diff: '/api/dsh-git-diff/diff' } as const
