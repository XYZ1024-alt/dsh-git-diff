window.__ModuleLoader__.load({
  id: "dsh-side-panel",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");

    const CSS = `
.dshp-panel{position:fixed;top:0;right:0;height:100vh;width:320px;z-index:1000;pointer-events:auto;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1,#fff);border-left:1px solid var(--dsw-alias-border-l1,#d0d7de);box-shadow:-6px 0 24px rgba(0,0,0,.12);overflow:hidden;font-family:system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.4;color:var(--dsw-alias-label-primary,#1f2328);text-align:left}
.dshp-toggle{position:fixed;top:50%;right:0;transform:translateY(-50%);z-index:1001;pointer-events:auto;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l1,#d0d7de);border-right:none;border-radius:8px 0 0 8px;padding:16px 6px;cursor:pointer;color:var(--dsw-alias-label-secondary,#57606a);box-shadow:-2px 0 10px rgba(0,0,0,.1);font-size:14px;line-height:1}
.dshp-toggle:hover{color:var(--dsw-alias-brand-primary,#0969da)}
.dshp-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1,#d0d7de);background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-layer-2,#f6f8fa))}
.dshp-title{font-weight:600}
.dshp-collapse,.dshp-close{background:none;border:none;cursor:pointer;font-size:18px;line-height:1;color:var(--dsw-alias-label-secondary,#57606a);padding:4px 8px;border-radius:6px}
.dshp-collapse:hover,.dshp-close:hover{color:var(--dsw-alias-label-primary,#1f2328);background:var(--dsw-alias-bg-layer-2,#f0f2f4)}
.dshp-tabs{display:flex;border-bottom:1px solid var(--dsw-alias-border-l1,#d0d7de)}
.dshp-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:none;border:none;border-bottom:2px solid transparent;padding:9px 4px;cursor:pointer;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#57606a)}
.dshp-tab:hover{color:var(--dsw-alias-label-primary,#1f2328)}
.dshp-tab-on{color:var(--dsw-alias-brand-primary,#0969da);border-bottom-color:var(--dsw-alias-brand-primary,#0969da)}
.dshp-tab-icon{display:inline-flex;align-items:center}
.dshp-content{flex:1;overflow-y:auto;background:var(--dsw-alias-bg-base,#fff)}
.dshp-list{display:flex;flex-direction:column;padding:6px}
.dshp-item{display:flex;align-items:center;gap:6px;width:100%;text-align:left;background:none;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;font-size:12.5px;color:var(--dsw-alias-label-primary,#1f2328)}
.dshp-item:hover{background:var(--dsw-alias-bg-layer-2,#f0f2f4)}
.dshp-file{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px}
.dshp-dir{font-weight:500}
.dshp-hint{padding:14px 12px;color:var(--dsw-alias-label-secondary,#57606a);font-size:12.5px}
.dshp-err{color:var(--dsw-alias-state-error-primary,#cf222e)}
.dshp-crumb{padding:8px 12px 4px;color:var(--dsw-alias-label-secondary,#57606a);font-size:11px;font-family:ui-monospace,Menlo,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:rtl;text-align:left}
.dshp-branch{padding:8px 12px 2px;font-size:12px;font-weight:600;color:var(--dsw-alias-brand-primary,#0969da)}
.dshp-legend{padding:2px 12px 8px;font-size:11px;color:var(--dsw-alias-label-secondary,#57606a)}
.dshp-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 4px;border-radius:4px;font-size:11px;font-weight:700;font-family:ui-monospace,Menlo,Consolas,monospace}
.dshp-badge-m{background:#ddf4ff;color:#0969da}
.dshp-badge-a{background:#dafbe1;color:#1a7f37}
.dshp-badge-d{background:#ffebe9;color:#cf222e}
.dshp-badge-u{background:#fff8c5;color:#9a6700}
.dshp-badge-r{background:#fbefff;color:#8250df}
.dshp-badge-c{background:#fbefff;color:#8250df}
.dshp-vcs-path{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshp-hist{flex-direction:column;align-items:stretch}
.dshp-hist-role{font-size:11px;font-weight:600;color:var(--dsw-alias-brand-primary,#0969da)}
.dshp-hist-label{color:var(--dsw-alias-label-secondary,#57606a);font-size:12px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshp-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1100;pointer-events:auto;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:40px}
.dshp-modal{width:860px;max-width:100%;max-height:100%;display:flex;flex-direction:column;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#fff));border:1px solid var(--dsw-alias-border-l2,#8c959f);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}
.dshp-modal-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1,#d0d7de);background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-layer-2,#f6f8fa))}
.dshp-modal-title{font-size:13px;font-weight:600;font-family:ui-monospace,Menlo,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshp-modal-body{overflow:auto;flex:1}
.dshp-code{margin:0;padding:12px 14px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-primary,#1f2328);white-space:pre;background:var(--dsw-alias-bg-base,#fff)}
.dshp-line{white-space:pre}
.dshp-add{background:rgba(26,127,55,.1);color:var(--dsw-alias-state-success-primary,#1a7f37)}
.dshp-del{background:rgba(207,34,46,.1);color:var(--dsw-alias-state-error-primary,#cf222e)}
.dshp-hunk{color:var(--dsw-alias-brand-primary,#0969da);font-weight:600}
.dshp-meta{color:var(--dsw-alias-label-secondary,#57606a);font-weight:600}
`;

    const inject = ["slots", "sessions"];

    function applyStyles(ctx) {
      ctx.effect(() => {
        const el = document.createElement("style");
        el.textContent = CSS;
        document.head.append(el);
        return () => el.remove();
      }, "dsh-side-panel: styles");
    }

    function rpc(name, params) {
      const parts = [];
      for (const k of Object.keys(params || {})) {
        const v = params[k];
        if (v === undefined || v === null || v === "") continue;
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
      }
      const qs = parts.length > 0 ? "?" + parts.join("&") : "";
      return fetch("/dev-panel/" + name + qs).then((r) => r.json());
    }

    function FilesIcon(props) {
      return React.createElement("svg", { width: props.size, height: props.size, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true },
        React.createElement("path", { d: "M5.19629 1.57104C5.81144 1.5711 6.38623 1.8786 6.72754 2.39038L7.19922 3.09839C7.28454 3.22635 7.42824 3.30344 7.58203 3.30347H12.1699C13.5039 3.30348 14.5859 4.38548 14.5859 5.71948V6.62671C15.2694 7.02689 15.6605 7.85012 15.4385 8.68726L14.3848 12.658C14.1037 13.7164 13.1449 14.4527 12.0498 14.4529H2.91699C1.51651 14.4529 0.451662 13.2814 0.501954 11.9519V3.98706C0.501954 2.65305 1.58396 1.57104 2.91797 1.57104H5.19629ZM3.7793 7.75562C3.30994 7.75562 2.89883 8.07153 2.77832 8.52515L1.91602 11.7722C1.74167 12.4291 2.23734 13.073 2.91699 13.073H12.0498C12.5191 13.0728 12.9304 12.757 13.0508 12.3035L14.1045 8.33374C14.1819 8.04202 13.9619 7.756 13.6602 7.75562H3.7793ZM2.91797 2.9519C2.34625 2.9519 1.88281 3.41534 1.88281 3.98706V7.2937C2.33068 6.7269 3.02249 6.37476 3.7793 6.37476H13.2051V5.71948C13.2051 5.14777 12.7416 4.68434 12.1699 4.68433H7.58203C6.96675 4.6843 6.39209 4.37595 6.05078 3.86401L5.5791 3.15601C5.49379 3.02821 5.34995 2.95196 5.19629 2.9519H2.91797Z", fill: "currentColor" })
      );
    }

    function HistoryIcon(props) {
      return React.createElement("svg", { width: props.size, height: props.size, viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true },
        React.createElement("path", { d: "M7.00049 0.199829C3.24488 0.199829 0.199952 3.24408 0.199707 6.99963C0.199707 8.0414 0.434087 9.03061 0.854004 9.91467L1.11279 10.4576L2.19775 9.94202L1.94092 9.39905L1.81787 9.12268C1.5498 8.46885 1.40186 7.75171 1.40186 6.99963C1.4021 3.90808 3.90888 1.40198 7.00049 1.40198C10.0919 1.40219 12.5979 3.90821 12.5981 6.99963C12.5981 10.0913 10.0921 12.5981 7.00049 12.5983C6.36734 12.5983 5.90348 12.5535 5.49268 12.4401C5.08803 12.3283 4.7041 12.1414 4.24463 11.8209C3.57111 11.3511 2.60588 11.1855 1.81006 11.6881L1.79736 11.6959L1.78467 11.7047L1.25537 12.0778L1.65381 13.2672L2.46045 12.6989C2.75029 12.5214 3.18004 12.5442 3.55615 12.8063C4.10063 13.1861 4.60863 13.4423 5.17334 13.5983C5.73194 13.7525 6.31665 13.8004 7.00049 13.8004C10.7561 13.8002 13.8003 10.7553 13.8003 6.99963C13.8 3.24421 10.7559 0.200041 7.00049 0.199829ZM3.81201 7.47327V8.67542H7.11572V7.47327H3.81201ZM3.81201 6.34924H10.2173V5.14709H3.81201V6.34924Z", fill: "currentColor" })
      );
    }

    function VcsIcon(props) {
      return React.createElement("svg", { width: props.size, height: props.size, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true },
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M13.0762 1.37207C14.0846 1.37228 14.9021 2.19077 14.9023 3.19922C14.9022 4.20772 14.0847 5.02518 13.0762 5.02539C12.2967 5.02539 11.6325 4.53691 11.3701 3.84961H4.35547C4.79397 4.26458 5.15861 4.7644 5.41699 5.33496L7.10645 9.06738C7.88526 10.7875 9.55104 11.9228 11.4189 12.0371C11.7085 11.4109 12.3411 10.9756 13.0762 10.9756C14.0843 10.9759 14.9023 11.7936 14.9023 12.8018C14.9023 13.81 14.0843 14.6277 13.0762 14.6279C12.2534 14.6279 11.5574 14.0832 11.3291 13.335C8.9868 13.1879 6.89981 11.7612 5.92285 9.60352L4.23242 5.87109C3.67503 4.64033 2.44878 3.84961 1.09766 3.84961V2.54883C1.10665 2.54883 1.11601 2.54975 1.125 2.5498L11.3701 2.54883C11.6326 1.86151 12.2969 1.37207 13.0762 1.37207ZM13.0762 12.2764C12.7858 12.2764 12.5508 12.5114 12.5508 12.8018C12.5508 13.0921 12.7858 13.3281 13.0762 13.3281C13.3664 13.3279 13.6025 13.092 13.6025 12.8018C13.6025 12.5115 13.3664 12.2766 13.0762 12.2764ZM13.0762 2.67285C12.7855 2.67285 12.55 2.90861 12.5498 3.19922C12.5499 3.48987 12.7855 3.72559 13.0762 3.72559C13.3667 3.72538 13.6024 3.48975 13.6025 3.19922C13.6023 2.90874 13.3666 2.67306 13.0762 2.67285Z", fill: "currentColor" })
      );
    }

    function basename(p) { return String(p || "").replace(/[\\/]+$/, "").split(/[\\/]/).pop() || String(p || ""); }

    function parentDir(p) {
      const s = String(p).replace(/[\\/]+$/, "");
      const idx = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
      if (idx < 0) return null;
      if (idx === 0) return null;
      if (idx === 2 && s.charAt(1) === ":") return null;
      return s.slice(0, idx);
    }

    function contentText(content) {
      if (!Array.isArray(content)) return "";
      const parts = [];
      for (const b of content) {
        if (b && b.type === "text" && typeof b.text === "string") parts.push(b.text);
      }
      return parts.join(" ").replace(/\s+/g, " ").slice(0, 140);
    }

    function blocksText(blocks) {
      if (!Array.isArray(blocks)) return "";
      const parts = [];
      for (const b of blocks) {
        if (b && b.kind === "text" && typeof b.text === "string") parts.push(b.text);
      }
      return parts.join(" ").replace(/\s+/g, " ").slice(0, 140);
    }

    function assistantHasText(blocks) {
      if (!Array.isArray(blocks)) return false;
      for (const b of blocks) {
        if (b && b.kind === "text" && typeof b.text === "string" && b.text.trim() !== "") return true;
      }
      return false;
    }

    function historyItem(node) {
      const kind = node.kind;
      const data = node.data;
      if (kind === "user") return { key: node.key, kind, role: "You", label: contentText(data && data.content), seq: node.anchorSeq };
      if (kind === "assistant-step") {
        if (!assistantHasText(data && data.blocks)) return null;
        return { key: node.key, kind, role: "Assistant", label: blocksText(data && data.blocks), seq: node.anchorSeq };
      }
      return null;
    }

    function buildHistory(snap) {
      const order = (snap && snap.chat && snap.chat.order) || [];
      const nodes = snap && snap.chat && snap.chat.nodes;
      const items = [];
      if (nodes) {
        for (const key of order) {
          const node = nodes.get(key);
          if (node) {
            const item = historyItem(node);
            if (item !== null) items.push(item);
          }
        }
      }
      return items;
    }

    function scrollToKey(key) {
      const all = document.querySelectorAll("[data-chat-anchor-key]");
      for (const el of all) {
        if (el.getAttribute("data-chat-anchor-key") === key) {
          if (typeof el.scrollIntoView === "function") el.scrollIntoView({ behavior: "smooth", block: "center" });
          return true;
        }
      }
      return false;
    }

    function StatusBadge(props) {
      const m = { M: ["M", "modified"], A: ["A", "added"], D: ["D", "deleted"], U: ["U", "untracked"], R: ["R", "renamed"], C: ["C", "copied"] }[props.s] || [props.s, ""];
      return React.createElement("span", { className: "dshp-badge dshp-badge-" + String(props.s).toLowerCase(), title: m[1] }, m[0]);
    }

    function CodeView(props) {
      if (!props.diff) return React.createElement("pre", { className: "dshp-code" }, props.text || "");
      const lines = String(props.text || "").split(/\r?\n/);
      const kids = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let cls = "dshp-line";
        if (line.charAt(0) === "+") cls += " dshp-add";
        else if (line.charAt(0) === "-") cls += " dshp-del";
        else if (line.charAt(0) === "@") cls += " dshp-hunk";
        else if (line.slice(0, 4) === "diff" || line.slice(0, 5) === "index" || line.slice(0, 3) === "---" || line.slice(0, 3) === "+++" || line.slice(0, 8) === "new file" || line.slice(0, 7) === "deleted" || line.slice(0, 6) === "rename" || line.slice(0, 4) === "copy") cls += " dshp-meta";
        kids.push(React.createElement("div", { key: i, className: cls }, line === "" ? "\u00A0" : line));
      }
      return React.createElement("div", { className: "dshp-code" }, kids);
    }

    function Modal(props) {
      const m = props.modal;
      let body;
      if (m.kind === "loading") body = React.createElement("div", { className: "dshp-hint" }, "Loading\u2026");
      else if (m.kind === "unsupported" || m.kind === "error") body = React.createElement("div", { className: "dshp-hint dshp-err" }, m.message || "Unsupported file format");
      else if (m.kind === "diff") body = React.createElement(CodeView, { text: m.diff, diff: true });
      else body = React.createElement(CodeView, { text: m.content, diff: false });
      return React.createElement("div", {
        className: "dshp-backdrop",
        onClick: (e) => { if (e.target === e.currentTarget) props.onClose(); },
      },
        React.createElement("div", { className: "dshp-modal", role: "dialog" },
          React.createElement("div", { className: "dshp-modal-head" },
            React.createElement("span", { className: "dshp-modal-title" }, m.title || ""),
            React.createElement("button", { type: "button", className: "dshp-close", "aria-label": "Close", onClick: props.onClose }, "\u00D7")
          ),
          React.createElement("div", { className: "dshp-modal-body" }, body)
        )
      );
    }

    function Panel(props) {
      const useSessions = props.useSessions;
      const sessions = props.sessions;
      const sessionId = useSessions((s) => s.current);
      const cwd = useSessions((s) => {
        const cur = s.current;
        const row = cur ? s.byId[cur] : undefined;
        return row ? row.cwd : undefined;
      });

      const [collapsed, setCollapsed] = React.useState(false);
      const [tab, setTab] = React.useState("files");
      const [modal, setModal] = React.useState(null);
      const [tick, setTick] = React.useState(0);

      React.useEffect(() => {
        if (sessionId === undefined || sessions === undefined) return;
        const binding = sessions.binding(sessionId);
        if (binding === undefined || binding.session === undefined) return;
        const bump = () => setTick((t) => t + 1);
        const dispose = binding.session.subscribe(bump);
        bump();
        return dispose;
      }, [sessionId]);

      void tick;

      let history = [];
      if (sessionId !== undefined && sessions !== undefined) {
        const binding = sessions.binding(sessionId);
        if (binding !== undefined && binding.session !== undefined) {
          history = buildHistory(binding.session.getSnapshot());
        }
      }

      const [files, setFiles] = React.useState(null);
      const [filesErr, setFilesErr] = React.useState(null);
      const [curDir, setCurDir] = React.useState(cwd);

      React.useEffect(() => { setCurDir(cwd); }, [cwd]);
      React.useEffect(() => {
        if (tab !== "files") return;
        let cancelled = false;
        setFiles(null);
        setFilesErr(null);
        if (curDir === undefined || curDir === "") { setFilesErr("No current directory"); return; }
        rpc("list-files", { dir: curDir }).then((res) => {
          if (cancelled) return;
          if (res && res.ok) setFiles(res);
          else setFilesErr((res && res.error) || (res && res.message) || "Failed to list files");
        }).catch((e) => { if (!cancelled) setFilesErr(String((e && e.message) || e)); });
        return () => { cancelled = true; };
      }, [tab, curDir]);

      const [git, setGit] = React.useState(null);
      React.useEffect(() => {
        if (tab !== "vcs") return;
        let cancelled = false;
        setGit(null);
        if (cwd === undefined || cwd === "") { setGit({ repo: false, entries: [], message: "No current directory" }); return; }
        rpc("git-status", { dir: cwd }).then((res) => {
          if (cancelled) return;
          if (res && res.ok) setGit(res);
          else setGit({ repo: false, entries: [], message: (res && res.error) || "Failed to read git status" });
        }).catch((e) => { if (!cancelled) setGit({ repo: false, entries: [], message: String((e && e.message) || e) }); });
        return () => { cancelled = true; };
      }, [tab, cwd]);

      function openFile(path) {
        setModal({ kind: "loading", title: basename(path) });
        rpc("read-file", { path }).then((res) => {
          if (res && res.ok) setModal({ kind: "file", title: res.name || basename(path), path, content: res.content });
          else setModal({ kind: "unsupported", title: basename(path), message: (res && res.message) || "Unsupported file format" });
        }).catch((e) => setModal({ kind: "unsupported", title: basename(path), message: String((e && e.message) || e) }));
      }

      function openDiff(entry) {
        setModal({ kind: "loading", title: entry.path });
        rpc("git-diff", { dir: cwd, path: entry.path, status: entry.status }).then((res) => {
          if (res && res.ok) setModal({ kind: "diff", title: res.header || entry.path, path: entry.path, diff: res.diff });
          else setModal({ kind: "error", title: entry.path, message: (res && res.error) || "Failed to load diff" });
        }).catch((e) => setModal({ kind: "error", title: entry.path, message: String((e && e.message) || e) }));
      }

      function goParent() {
        const p = parentDir(curDir);
        if (p && cwd && p.length >= String(cwd).replace(/[\\/]+$/, "").length) setCurDir(p);
      }

      function renderFiles() {
        if (filesErr) return React.createElement("div", { className: "dshp-hint dshp-err" }, filesErr);
        if (!files) return React.createElement("div", { className: "dshp-hint" }, "Loading\u2026");
        const kids = [];
        kids.push(React.createElement("div", { key: "crumb", className: "dshp-crumb" }, files.dir || ""));
        if (curDir && cwd && String(curDir).replace(/[\\/]+$/, "") !== String(cwd).replace(/[\\/]+$/, "")) {
          kids.push(React.createElement("button", { key: "up", className: "dshp-item dshp-dir", onClick: goParent }, "\u2191 .."));
        }
        for (let i = 0; i < files.dirs.length; i++) {
          const d = files.dirs[i];
          kids.push(React.createElement("button", { key: "d" + i, className: "dshp-item dshp-dir", onClick: () => setCurDir(d.path) }, "\uD83D\uDCC1 " + d.name));
        }
        for (let j = 0; j < files.files.length; j++) {
          const f = files.files[j];
          kids.push(React.createElement("button", { key: "f" + j, className: "dshp-item dshp-file", onClick: () => openFile(f.path) }, "\uD83D\uDCC4 " + f.name));
        }
        if (files.dirs.length === 0 && files.files.length === 0) {
          kids.push(React.createElement("div", { key: "empty", className: "dshp-hint" }, "Empty directory"));
        }
        return React.createElement("div", { className: "dshp-list" }, kids);
      }

      function renderHistory() {
        if (sessionId === undefined) return React.createElement("div", { className: "dshp-hint" }, "No active session");
        if (history.length === 0) return React.createElement("div", { className: "dshp-hint" }, "No conversation yet");
        const kids = [];
        for (const it of history) {
          kids.push(React.createElement("button", { key: it.key, className: "dshp-item dshp-hist", onClick: () => scrollToKey(it.key) },
            React.createElement("span", { className: "dshp-hist-role" }, it.role),
            React.createElement("span", { className: "dshp-hist-label" }, it.label || "(" + it.kind + ")")
          ));
        }
        return React.createElement("div", { className: "dshp-list" }, kids);
      }

      function renderVcs() {
        if (!git) return React.createElement("div", { className: "dshp-hint" }, "Loading\u2026");
        if (git.repo === false) return React.createElement("div", { className: "dshp-hint" }, git.message || "Not a git repository");
        if (!git.entries || git.entries.length === 0) return React.createElement("div", { className: "dshp-hint" }, "Working tree clean");
        const kids = [];
        if (git.branch) kids.push(React.createElement("div", { key: "b", className: "dshp-branch" }, "\u2387 " + git.branch));
        kids.push(React.createElement("div", { key: "legend", className: "dshp-legend" }, "M modified  A added  D deleted  U untracked  R renamed"));
        for (const e of git.entries) {
          kids.push(React.createElement("button", { key: e.path, className: "dshp-item dshp-vcs", onClick: () => openDiff(e) },
            React.createElement(StatusBadge, { s: e.status }),
            React.createElement("span", { className: "dshp-vcs-path" }, e.path)
          ));
        }
        return React.createElement("div", { className: "dshp-list" }, kids);
      }

      function tabBtn(id, label, icon) {
        return React.createElement("button", {
          type: "button",
          key: id,
          className: "dshp-tab" + (tab === id ? " dshp-tab-on" : ""),
          onClick: () => setTab(id),
        },
          React.createElement("span", { className: "dshp-tab-icon" }, icon),
          label
        );
      }

      const tabs = React.createElement("div", { className: "dshp-tabs" },
        tabBtn("files", "Files", React.createElement(FilesIcon, { size: 14 })),
        tabBtn("history", "History", React.createElement(HistoryIcon, { size: 14 })),
        tabBtn("vcs", "VCS", React.createElement(VcsIcon, { size: 14 }))
      );
      const head = React.createElement("div", { className: "dshp-head" },
        React.createElement("span", { className: "dshp-title" }, "Panel"),
        React.createElement("button", { type: "button", className: "dshp-collapse", "aria-label": "Collapse panel", onClick: () => setCollapsed(true) }, "\u00BB")
      );
      const toggle = React.createElement("button", { type: "button", className: "dshp-toggle", "aria-label": "Expand panel", onClick: () => setCollapsed(false) }, "\u00AB");
      const modalEl = modal ? React.createElement(Modal, { modal, onClose: () => setModal(null) }) : null;

      if (collapsed) return React.createElement("div", null, toggle, modalEl);
      return React.createElement("div", null,
        React.createElement("div", { className: "dshp-panel" },
          head,
          tabs,
          React.createElement("div", { className: "dshp-content" }, tab === "files" ? renderFiles() : (tab === "history" ? renderHistory() : renderVcs()))
        ),
        modalEl
      );
    }

    function apply(ctx) {
      applyStyles(ctx);
      ctx.slots.inject("shell.overlay", () => ctx.slots.register(
        { name: "shell.overlay", id: "dsh-side-panel", order: 100 },
        (props) => {
          if (typeof props.useSessions !== "function") return null;
          return React.createElement(Panel, { useSessions: props.useSessions, sessions: ctx.sessions });
        }
      ));
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
