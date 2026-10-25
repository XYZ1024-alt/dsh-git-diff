/**
 * Two-column diff: `HEAD` on the left, the working tree on the right, with
 * each changed line facing its counterpart.
 */
import { Fragment, useMemo } from 'react'
import styles from './SplitDiff.module.css'
import { type SideLine, splitRows } from './split-diff.ts'

/** Localized chrome of {@link SplitDiff}. */
export interface SplitDiffLabels {
  old: string
  new: string
  gap: (count: number) => string
}

type Side = 'old' | 'new'

function Cell({ line, side, changed }: { line: SideLine | undefined; side: Side; changed: boolean }) {
  const state = line === undefined ? 'empty' : changed ? (side === 'old' ? 'deleted' : 'added') : 'context'
  return (
    <>
      <span className={styles.number} data-side={side} data-state={state}>
        {line?.no}
      </span>
      <span className={styles.text} data-state={state}>
        {line?.text}
      </span>
    </>
  )
}

export function SplitDiff({ oldText, newText, labels }: { oldText: string | null; newText: string; labels: SplitDiffLabels }) {
  const rows = useMemo(() => splitRows(oldText, newText), [oldText, newText])
  return (
    <div className={styles.block}>
      <div className={styles.grid}>
        <span className={styles.heading}>{labels.old}</span>
        <span className={styles.heading}>{labels.new}</span>
        {rows.map((row, index) => (
          // Rows are derived from immutable text and never reorder.
          // biome-ignore lint/suspicious/noArrayIndexKey: positional rows
          <Fragment key={index}>
            {row.kind === 'gap' ? (
              <span className={styles.gap}>{labels.gap(row.hidden)}</span>
            ) : (
              <>
                <Cell line={row.old} side="old" changed={row.kind === 'change'} />
                <Cell line={row.new} side="new" changed={row.kind === 'change'} />
              </>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
