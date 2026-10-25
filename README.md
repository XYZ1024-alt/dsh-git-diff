# dsh-git-diff

Adds a **Git changes** tab to the right Sidebar of the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI (`dsh web`), next to the built-in Files and Terminal tabs.

- Open it from the Sidebar guide. The header shows the current branch and how many paths changed.
- Changed paths are listed with `M` / `A` / `D` / `R` / `C` / `T` / `U` (untracked) / `!` (conflict) badges. Paths that are already staged are marked.
- Expand a path to compare it side by side (see [Diff view](#diff-view)). Use the arrow button to open the file in the Sidebar preview; deleted paths have no such button.
- The list refreshes when the tab becomes visible, when an agent turn finishes, and on the Sidebar refresh command or button.

Version 1.x drew its own Files and History panels. DSH now ships both natively: the Files tab, and turn navigation in the chat. 2.0 therefore keeps only the git view and rebuilds it on the right-Sidebar tab API.

## Diff view

An expanded path shows two aligned columns: `HEAD` on the left, the working tree on the right.

- Each column has its own line numbers. Removed lines are red on the left, added lines are green on the right, and a changed line faces its replacement. A line with no counterpart leaves a blank cell on the other side.
- Three lines of context surround each change. Longer unchanged stretches fold into a single "N unchanged lines" row.
- A new or untracked file fills only the right column. A deleted file fills only the left column.
- Long lines wrap inside their column, so the view fits a narrow Sidebar.
- Binary files, and files where either side exceeds 512 KiB, show a note instead of a diff.

## Requirements

- DeepSeek Harness `>=0.2.1-rc.2 <0.3.0` with the **web** profile.
- `git` on `PATH` in the Session's execution environment.

## Installation

The package is a DeepSeek Harness bundle. Its `cordis.patch.yml` registers one row, which loads both the Host half (`lib/index.js`) and the browser half (`lib/client.js`).

```bash
# from GitHub (pin a commit for reproducibility: ...#<commit-sha>)
dsh plugin --profile web add github:XYZ1024-alt/dsh-git-diff
# or from a local checkout, run in its parent directory
dsh plugin --profile web add ./dsh-git-diff
```

The built JavaScript in `lib/` is committed, so installation does not run a build. Reload the page after installing. Remove the plugin with `dsh plugin --profile web remove dsh-git-diff`.

## Security

The plugin registers two read-only GET routes, `/api/dsh-git-diff/status` and `/api/dsh-git-diff/diff`, as exact Fetch routes on DSH's shared `/api` channel. Before a request reaches them, DSH's Connection applies its Host/Origin trust checks and browser authentication, and only owner Peers get through.

- Each request names a Session. Git runs only in that Session's working directory.
- The diff route returns content only for paths that `git status` currently reports as changed, and only inside the repository root.

## Development

```bash
pnpm install
pnpm check   # typecheck (Host and client separately), Biome, build lib/
```

| Path | Role |
|---|---|
| `src/contract.ts` | Zod schemas for the wire responses, shared by both halves |
| `src/routes.ts` | Route paths |
| `src/host/` | Host plugin: Session to working directory, git through `ctx.subprocess`, file reads through `ctx.fs` |
| `src/client/index.ts` | Browser plugin entry: tab type, guide entry, tab body registration |
| `src/client/GitChangesBody.tsx` | Tab body: branch header, change list, per-path diff loading |
| `src/client/split-diff.ts` | Side-by-side row model: local patches from `diff`, paired old/new lines, folded gaps |
| `src/client/SplitDiff.tsx` | Two-column diff renderer |
| `src/client/api.ts` | Browser adapter over the Host routes, parsed with the shared contract |
| `src/client/locales.ts` | English and Chinese dictionaries |
| `scripts/build.mjs` | esbuild: ESM Host bundle and client bundle in the DSH module-loader envelope, with CSS-module styles injected |

The client bundle imports only from the Web shell's platform modules (`react`, `zod`, `@deepseek-ai/dsh-client-ui-primitives`, and so on). Everything else, including `swr` and `diff`, is bundled. The build fails when the client imports any other `@deepseek-ai/*` package at runtime.

## License

[MIT](./LICENSE)
