/**
 * Side-by-side model of a `HEAD` versus working-tree comparison: local patches
 * with three lines of context, each line paired with its counterpart so the
 * old side and the new side render as two aligned columns.
 */
import { structuredPatch } from 'diff'

/** Unchanged lines kept around each patch. */
const CONTEXT_LINES = 3

/** Wall-clock budget for the edit-graph search before falling back to a whole replacement. */
const DIFF_TIMEOUT_MS = 1000

/** One line of one side, numbered from 1. */
export interface SideLine {
  no: number
  text: string
}

/** One aligned row: a shared context line, a changed pair, or a run of omitted unchanged lines. */
export type SplitRow =
  | { kind: 'context'; old: SideLine; new: SideLine }
  | { kind: 'change'; old: SideLine | undefined; new: SideLine | undefined }
  | { kind: 'gap'; hidden: number }

/**
 * Content lines of one side: empty text has none, and a single trailing
 * newline terminates the last line instead of opening an empty one.
 */
function contentLines(text: string): string[] {
  if (text === '') return []
  return (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n')
}

/**
 * Build the aligned rows of a two-column diff.
 * @param oldText - `HEAD` content; `null` when the path is new.
 * @param newText - working-tree content; empty when the path was deleted.
 * @returns rows in file order; an unchanged file yields a single gap.
 */
export function splitRows(oldText: string | null, newText: string): SplitRow[] {
  const oldLines = contentLines(oldText ?? '')
  const newLines = contentLines(newText)
  const normalize = (lines: string[]) => lines.map((line) => `${line}\n`).join('')
  const hunks = structuredPatch('', '', normalize(oldLines), normalize(newLines), undefined, undefined, {
    context: CONTEXT_LINES,
    timeout: DIFF_TIMEOUT_MS,
  })?.hunks ?? [{ oldStart: 1, newStart: 1, lines: [...oldLines.map((line) => `-${line}`), ...newLines.map((line) => `+${line}`)] }]

  const rows: SplitRow[] = []
  // 0-based index of the next old line not yet emitted.
  let oldCursor = 0
  for (const hunk of hunks) {
    // An empty side reports start 0; its first line is still index 0.
    let oldNo = Math.max(hunk.oldStart, 1)
    let newNo = Math.max(hunk.newStart, 1)
    if (oldNo - 1 > oldCursor) rows.push({ kind: 'gap', hidden: oldNo - 1 - oldCursor })
    let removed: SideLine[] = []
    let added: SideLine[] = []
    const flush = () => {
      for (let index = 0; index < Math.max(removed.length, added.length); index++) {
        rows.push({ kind: 'change', old: removed[index], new: added[index] })
      }
      removed = []
      added = []
    }
    for (const line of hunk.lines) {
      const text = line.slice(1)
      if (line.startsWith('-')) removed.push({ no: oldNo++, text })
      else if (line.startsWith('+')) added.push({ no: newNo++, text })
      else {
        flush()
        rows.push({ kind: 'context', old: { no: oldNo++, text }, new: { no: newNo++, text } })
      }
    }
    flush()
    oldCursor = oldNo - 1
  }
  if (oldLines.length > oldCursor) rows.push({ kind: 'gap', hidden: oldLines.length - oldCursor })
  return rows
}
