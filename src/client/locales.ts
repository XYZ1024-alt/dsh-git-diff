import type { LocaleDictOf } from '@deepseek-ai/dsh-client-ui-slots'

/** This plugin's locale namespace. */
export const NS = 'dshGitDiff'

const en = {
  'type.label': 'Git changes',
  'guide.title': 'Git changes',
  'guide.description': 'Review uncommitted changes and their diffs.',
  refresh: 'Refresh',
  openFile: 'Open file',
  detached: 'Detached HEAD',
  count: '{count} changed',
  loading: 'Reading git status…',
  failed: 'Could not read git status: {message}',
  retry: 'Retry',
  notRepository: 'The working directory is not inside a git repository.',
  clean: 'No uncommitted changes.',
  staged: 'Staged',
  diffLoading: 'Loading diff…',
  diffFailed: 'Could not load the diff: {message}',
  binary: 'Binary file; no text diff.',
  tooLarge: 'File is too large to compare here.',
  'kind.modified': 'Modified',
  'kind.added': 'Added',
  'kind.deleted': 'Deleted',
  'kind.renamed': 'Renamed',
  'kind.copied': 'Copied',
  'kind.typechange': 'Type changed',
  'kind.untracked': 'Untracked',
  'kind.conflicted': 'Conflicted',
  'diff.old': 'HEAD',
  'diff.new': 'Working tree',
  'diff.gap': '{count} unchanged lines',
}

export type GitKey = keyof typeof en

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    dshGitDiff: GitKey
  }
}

const zh: LocaleDictOf<typeof NS> = {
  'type.label': 'Git 变更',
  'guide.title': 'Git 变更',
  'guide.description': '查看未提交的改动及其 diff。',
  refresh: '刷新',
  openFile: '打开文件',
  detached: '游离 HEAD',
  count: '{count} 个改动',
  loading: '正在读取 git 状态…',
  failed: '无法读取 git 状态：{message}',
  retry: '重试',
  notRepository: '当前工作目录不在 git 仓库中。',
  clean: '没有未提交的改动。',
  staged: '已暂存',
  diffLoading: '正在加载 diff…',
  diffFailed: '无法加载 diff：{message}',
  binary: '二进制文件，无法显示文本 diff。',
  tooLarge: '文件过大，无法在此对比。',
  'kind.modified': '已修改',
  'kind.added': '新增',
  'kind.deleted': '已删除',
  'kind.renamed': '已重命名',
  'kind.copied': '已复制',
  'kind.typechange': '类型变更',
  'kind.untracked': '未跟踪',
  'kind.conflicted': '冲突',
  'diff.old': 'HEAD',
  'diff.new': '工作区',
  'diff.gap': '{count} 行未改动',
}

/** Dictionaries for every built-in locale. */
export const dictionaries = { en: en satisfies LocaleDictOf<typeof NS>, zh }
