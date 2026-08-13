# dsh-side-panel

A right-side developer panel for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI (`dsh web`). It adds a collapsible side panel with three tabs:

- **Files** — browse the current session's working directory; click a text/code file to preview it in a popup (unsupported formats show a message).
- **History** — list the current conversation (user messages + assistant replies); click an entry to scroll the chat to it.
- **VCS** — show `git status` for the current directory as `M` / `A` / `D` / `U` / `R` badges; click a changed file to view its diff.

## Requirements

- A DeepSeek Harness deployment with the **web** profile (`dsh web`).
- `git` on `PATH` (for the VCS tab).

## Installation

The plugin is a small dual-face package: a Node half (filesystem + git primitives) and a browser half (the UI), discovered via the package's `dsh.client` declaration.

`$DSH_HOME` is your harness home (defaults to `~/.dsh` on macOS/Linux and `C:\Users\<you>\.dsh` on Windows).

### Method 1 — copy into the profile (recommended)

1. Copy the whole `dsh-side-panel/` folder into the profile's hoisted `node_modules`:

   - **macOS / Linux**
     ```bash
     cp -R ./dsh-side-panel "$DSH_HOME/profiles/node_modules/dsh-side-panel"
     ```
   - **Windows (PowerShell)**
     ```powershell
     Copy-Item -Recurse .\dsh-side-panel "$env:DSH_HOME\profiles\node_modules\dsh-side-panel"
     ```

2. Register the row in the web profile's patch layer, `$DSH_HOME/profiles/web/cordis.patch.yml`:

   ```yaml
   - insert:
       - id: dsh-side-panel
         name: dsh-side-panel
   ```

   If the file already has an `- insert:` block, add the two `id` / `name` lines under it instead of adding a second block.

3. Restart `dsh web` and refresh the page. The panel appears on the right edge.

### Method 2 — clone and copy

```bash
git clone git@github.com:XYZ1024-alt/dsh-side-panel.git
# then follow Method 1 steps 1–3 using the cloned folder
```

## Usage

Open the panel from the right edge of the web UI and switch between the three tabs. Click a file or a changed path to open a popup; close it with the × button or by clicking the blank area outside.

## Security

The `/dev-panel/*` routes read the filesystem and run `git` without their own authentication or sandboxing. The panel is intended for local / loopback use (`dsh web` binds `127.0.0.1` by default). Do not expose the server to a network you do not trust.

## License

[MIT](./LICENSE)
