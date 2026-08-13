# dsh-side-panel

A right-side developer panel for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI (`dsh web`). It adds a collapsible side panel with three tabs:

- **Files** — browse the current session's working directory; click a text/code file to preview it in a popup (unsupported formats show a message).
- **History** — list the current conversation (user messages + assistant replies); click an entry to scroll the chat to it.
- **VCS** — show `git status` for the current directory as `M` / `A` / `D` / `U` / `R` badges; click a changed file to view its diff.

## Requirements

- A DeepSeek Harness deployment with the **web** profile (`dsh web`).
- `git` on `PATH` (for the VCS tab).

## Installation

The plugin is distributed as a DeepSeek Harness bundle. Its bundle patch
registers both the Node half (filesystem + git primitives) and the browser half
(the UI), so no files or patch rows need to be copied manually.

### Install from GitHub

Install it directly into the `web` profile:

```bash
dsh plugin --profile web add github:XYZ1024-alt/dsh-side-panel
```

This repository commits its ready-to-run JavaScript, so installation does not
run a build script and does not require pnpm build authorization.

For a reproducible installation, pin a trusted commit:

```bash
dsh plugin --profile web add github:XYZ1024-alt/dsh-side-panel#<commit-sha>
```

Restart `dsh web` after installation and refresh the page. The panel appears on
the right edge.

### Install from npm

After the package is published to npm:

```bash
dsh plugin --profile web add dsh-side-panel
```

### Install a local checkout

From the parent directory of this repository:

```bash
dsh plugin --profile web add ./dsh-side-panel
```

### Verify

Inspect the composed profile before starting the web UI:

```bash
dsh --profile web --dump-config
```

The output should contain a `# == dsh-side-panel` bundle layer and the
`dsh-side-panel` plugin row.

### Uninstall

```bash
dsh plugin --profile web remove dsh-side-panel
```

## Usage

Open the panel from the right edge of the web UI and switch between the three tabs. Click a file or a changed path to open a popup; close it with the × button or by clicking the blank area outside.

## Security

The `/dev-panel/*` routes read the filesystem and run `git` without their own authentication or sandboxing. The panel is intended for local / loopback use (`dsh web` binds `127.0.0.1` by default). Do not expose the server to a network you do not trust.

## License

[MIT](./LICENSE)
