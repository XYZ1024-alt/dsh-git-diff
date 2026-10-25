/**
 * The "Git changes" tab body: the Session workspace's uncommitted changes, each
 * expandable into a side-by-side `HEAD` versus working-tree diff. Status refreshes when the
 * tab becomes visible, when a turn settles, and on the Sidebar refresh command.
 */
import {
  Button,
  FileTypeIcon,
  IconBranchOutlineRegular,
  IconChevronDownOutlineRegular,
  IconRefreshOutlineRegular,
  IconRightUpOutlineRegular,
  Tag,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { sessionFileAddress } from '@deepseek-ai/dsh-util-workspace-path'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import type { ChangeKind, GitChange } from '../contract.ts'
import { diffKey, fetchDiff, fetchStatus, isSessionKey, statusKey } from './api.ts'
import styles from './GitChangesBody.module.css'
import type { NS } from './locales.ts'
import { SplitDiff, type SplitDiffLabels } from './SplitDiff.tsx'

type Props = PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<typeof NS>
type T = Props['t']

const BADGE: Record<ChangeKind, string> = {
  modified: 'M',
  added: 'A',
  deleted: 'D',
  renamed: 'R',
  copied: 'C',
  typechange: 'T',
  untracked: 'U',
  conflicted: '!',
}

const errorText = (error: Error) => error.message

function splitPath(path: string): { name: string; dir: string } {
  const slash = path.lastIndexOf('/')
  return { name: path.slice(slash + 1), dir: slash < 0 ? '' : path.slice(0, slash) }
}

function ChangeDiff({ sessionId, change, t }: { sessionId: string; change: GitChange; t: T }) {
  const { data, error, isLoading } = useSWR(diffKey(sessionId, change.path), fetchDiff)
  const labels = useMemo<SplitDiffLabels>(() => ({ old: t('diff.old'), new: t('diff.new'), gap: (count) => t('diff.gap', { count }) }), [t])
  if (error instanceof Error) return <p className={styles.note}>{t('diffFailed', { message: errorText(error) })}</p>
  if (isLoading || data === undefined) return <p className={styles.note}>{t('diffLoading')}</p>
  if (data.kind === 'binary') return <p className={styles.note}>{t('binary')}</p>
  if (data.kind === 'too-large') return <p className={styles.note}>{t('tooLarge')}</p>
  return <SplitDiff oldText={data.oldText} newText={data.newText} labels={labels} />
}

function ChangeRow({
  sessionId,
  root,
  change,
  open,
  onToggle,
  onOpenFile,
  t,
}: {
  sessionId: string
  root: string
  change: GitChange
  open: boolean
  onToggle: (path: string) => void
  onOpenFile: (address: string) => void
  t: T
}) {
  const { name, dir } = splitPath(change.path)
  const kindLabel = t(`kind.${change.kind}`)
  return (
    <li>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          title={change.from ? `${change.from} → ${change.path}` : change.path}
          onClick={() => onToggle(change.path)}
        >
          <IconChevronDownOutlineRegular size={12} className={open ? styles.chevronOpen : styles.chevron} />
          <span className={styles.badge} data-kind={change.kind} title={kindLabel}>
            {BADGE[change.kind]}
          </span>
          <FileTypeIcon path={change.path} size={14} />
          <span className={styles.name}>{name}</span>
          <span className={styles.dir}>{dir}</span>
          {change.staged && <Tag tone="quiet">{t('staged')}</Tag>}
        </button>
        {change.kind !== 'deleted' && (
          <span className={styles.rowActions}>
            <Tooltip label={t('openFile')}>
              <Button
                variant="toolbar"
                size="sm"
                aria-label={t('openFile')}
                icon={<IconRightUpOutlineRegular size={14} />}
                onClick={() => onOpenFile(sessionFileAddress(sessionId, `${root}/${change.path}`))}
              />
            </Tooltip>
          </span>
        )}
      </div>
      {open && (
        <div className={styles.diff}>
          <ChangeDiff sessionId={sessionId} change={change} t={t} />
        </div>
      )}
    </li>
  )
}

export function GitChangesBody({ sessionId, useSession, useTabInfo, t }: Props) {
  const { tab } = useTabInfo()
  const running = useSession((session) => session.running)
  const { mutate } = useSWRConfig()
  const { data, error, isLoading, isValidating } = useSWR(statusKey(sessionId), fetchStatus)
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())

  const refresh = useCallback(() => void mutate(isSessionKey(sessionId)), [mutate, sessionId])

  useEffect(() => tab.actions.bindCommands({ refresh }), [tab.actions, refresh])

  useEffect(() => {
    if (tab.visible) refresh()
  }, [tab.visible, refresh])

  const wasRunning = useRef(running)
  useEffect(() => {
    if (wasRunning.current && !running) refresh()
    wasRunning.current = running
  }, [running, refresh])

  const toggle = useCallback((path: string) => {
    setExpanded((previous) => {
      const next = new Set(previous)
      if (!next.delete(path)) next.add(path)
      return next
    })
  }, [])

  const repository = data?.repository === true ? data : undefined

  let content: ReactNode
  if (error instanceof Error) {
    content = (
      <div className={styles.status}>
        <p className={styles.note}>{t('failed', { message: errorText(error) })}</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          {t('retry')}
        </Button>
      </div>
    )
  } else if (isLoading || data === undefined) {
    content = <p className={styles.note}>{t('loading')}</p>
  } else if (repository === undefined) {
    content = <p className={styles.note}>{t('notRepository')}</p>
  } else if (repository.changes.length === 0) {
    content = <p className={styles.note}>{t('clean')}</p>
  } else {
    content = (
      <ul className={styles.list}>
        {repository.changes.map((change) => (
          <ChangeRow
            key={change.path}
            sessionId={sessionId}
            root={repository.root}
            change={change}
            open={expanded.has(change.path)}
            onToggle={toggle}
            onOpenFile={tab.actions.openResource}
            t={t}
          />
        ))}
      </ul>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.branch}>
          <IconBranchOutlineRegular size={15} />
          <span className={styles.branchName}>{repository === undefined ? t('type.label') : (repository.branch ?? t('detached'))}</span>
        </span>
        {repository !== undefined && <span className={styles.count}>{t('count', { count: repository.changes.length })}</span>}
        <Tooltip label={t('refresh')}>
          <Button
            variant="toolbar"
            size="sm"
            aria-label={t('refresh')}
            disabled={isValidating}
            onClick={refresh}
            icon={<IconRefreshOutlineRegular size={15} />}
          />
        </Tooltip>
      </div>
      <div className={styles.body}>{content}</div>
    </div>
  )
}
