/**
 * dsh-git-diff, browser half: registers the "Git changes" tab type in the
 * right Sidebar (with its guide entry) and the tab body.
 */
import type { Context } from '@deepseek-ai/cordis'
import { IconBranchOutlineMedium } from '@deepseek-ai/dsh-client-ui-primitives'
import { GitChangesBody } from './GitChangesBody.tsx'
import { dictionaries, NS } from './locales.ts'

/** This tab type's identity in the tab system, and the key its body registers under. */
const TAB_ID = 'dsh-git-diff'

/** The tab kind this plugin owns. */
const TAB_KIND = 'git-changes'

export const inject = ['locale', 'slots', 'sidebarRightTabs']

export function apply(ctx: Context): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, dictionaries), 'dsh-git-diff: dictionaries')
  ctx.effect(
    () =>
      ctx.sidebarRightTabs.register({
        id: TAB_ID,
        kind: TAB_KIND,
        priority: 'extension',
        title: () => t('type.label'),
        guide: [{ id: 'git-changes', order: 30, title: () => t('guide.title'), description: () => t('guide.description'), icon: IconBranchOutlineMedium }],
      }),
    'dsh-git-diff: tab type',
  )
  ctx.effect(
    () => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS }, GitChangesBody)),
    'dsh-git-diff: tab body',
  )
}
