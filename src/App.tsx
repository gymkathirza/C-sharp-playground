import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import { addFile, addFolder, starterVfs, writeFile, type Vfs } from "./lib/vfs";
import { clearSessionStore, defaultSession, loadSession, saveSession } from "./lib/session";
import { downloadBlob, vfsToZip } from "./lib/zip";
import { FileTree } from "./ui/FileTree";
import { EditorTabs } from "./ui/EditorTabs";
import { ConsolePanel, type ConsoleLine } from "./ui/ConsolePanel";
import { LessonsPanel } from "./ui/LessonsPanel";
import { VersionSelector } from "./ui/VersionSelector";
import { CreateDialog } from "./ui/CreateDialog";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { applyChannelToCsproj, enabledChannels, parseManifest, type Channel } from "./lib/versions";
import type { Lesson } from "./lib/lessons";
import type { CsFileExt } from "./lib/paths";

const MANIFEST_URL = `${import.meta.env.BASE_URL}version-manifest.json`;
const PHASE1_RUN =
  "▶ Run is not yet available in the browser. Export your project and run with `dotnet run`.";

export function App() {
  const loaded = useRef(loadSession());
  const restored = useRef(loaded.current.restored);
  const [vfs, setVfs] = useState<Vfs>(loaded.current.session.vfs);
  const [openTabs, setOpenTabs] = useState<string[]>(loaded.current.session.openTabs);
  const [activeTab, setActiveTab] = useState<string | null>(loaded.current.session.activeTab);
  const [folder, setFolder] = useState("");
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<"file" | "folder" | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>(loaded.current.session.selectedVersion);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  useEffect(() => {
    if (restored.current) {
      setLines([{ kind: "system", text: "Session restored. Code was not run." }]);
    }
  }, []);

  useEffect(() => {
    fetch(MANIFEST_URL)
      .then((r) => r.json())
      .then((data) => {
        const manifest = parseManifest(data);
        if (!("error" in manifest)) setChannels(enabledChannels(manifest));
      })
      .catch(() => {
        /* keep editor usable without the manifest */
      });
  }, []);

  const persist = useCallback(
    (next?: Partial<{ vfs: Vfs; openTabs: string[]; activeTab: string | null; selectedVersion: string }>) => {
      setSaveError(
        saveSession({
          version: 1,
          vfs: next?.vfs ?? vfs,
          openTabs: next?.openTabs ?? openTabs,
          activeTab: next?.activeTab ?? activeTab,
          selectedVersion: next?.selectedVersion ?? selectedVersion,
        }),
      );
    },
    [vfs, openTabs, activeTab, selectedVersion],
  );

  useEffect(() => {
    persist();
  }, [vfs, openTabs, activeTab, selectedVersion, persist]);

  const openFile = (path: string) => {
    setActiveTab(path);
    setOpenTabs((tabs) => (tabs.includes(path) ? tabs : [...tabs, path]));
  };

  const closeTab = (path: string) => {
    const tabs = openTabs.filter((t) => t !== path);
    setOpenTabs(tabs);
    if (activeTab === path) setActiveTab(tabs[tabs.length - 1] ?? null);
  };

  const onCreateFile = (name: string, ext: CsFileExt) => {
    const next = addFile(vfs, folder, name, ext, "");
    if ("error" in next) return next.error;
    setVfs(next);
    openFile(`${folder ? `${folder}/` : ""}${name}.${ext}`);
    return null;
  };

  const onCreateFolder = (name: string) => {
    const next = addFolder(vfs, folder, name);
    if ("error" in next) return next.error;
    setVfs(next);
    setFolder(folder ? `${folder}/${name}` : name);
    return null;
  };

  const onSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson.id);
    const next = writeFile(vfs, "Program.cs", lesson.starterCode);
    if (!("error" in next)) {
      setVfs(next);
      openFile("Program.cs");
    }
  };

  const onVersionChange = (id: string) => {
    setSelectedVersion(id);
    const channel = channels.find((c) => c.id === id);
    if (!channel) return;
    const files = { ...vfs.files };
    for (const [path, content] of Object.entries(files)) {
      if (path.endsWith(".csproj")) files[path] = applyChannelToCsproj(content, channel);
    }
    setVfs({ ...vfs, files });
  };

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id: "cspg-workspace" });

  const extensions = useMemo(
    () => [
      java(),
      EditorView.theme({
        "&": { fontSize: "14px" },
        ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
      }),
      oneDark,
    ],
    [],
  );

  const source = activeTab ? (vfs.files[activeTab] ?? "") : "";

  return (
    <div className="app theme-dark">
      <header className="banner" role="banner">
        <h1>C# Playground</h1>
        {channels.length > 0 && (
          <VersionSelector channels={channels} selected={selectedVersion} onChange={onVersionChange} />
        )}
        <button
          type="button"
          className="primary"
          disabled={!activeTab}
          aria-label="Run (not available in browser)"
          title={PHASE1_RUN}
          onClick={() => setLines([{ kind: "system", text: PHASE1_RUN }])}
        >
          ▶ Run
        </button>
        <button
          type="button"
          aria-label="Export project as ZIP"
          onClick={async () => {
            const blob = await vfsToZip(vfs);
            downloadBlob(blob, "csharp-project.zip");
          }}
        >
          Export ZIP
        </button>
        <button type="button" aria-label="Clear session and restore starter project" onClick={() => setConfirmClear(true)}>
          Clear
        </button>
      </header>
      <Group
        orientation="horizontal"
        className="workspace"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        <Panel id="lessons" defaultSize="16%" minSize="10%" className="lessons-panel">
          <LessonsPanel activeLesson={activeLesson} onSelectLesson={onSelectLesson} />
        </Panel>
        <Separator className="resize-handle" aria-label="Resize lessons panel" />
        <Panel id="files" defaultSize="16%" minSize="10%" className="sidebar-panel">
          <nav className="sidebar" aria-label="Files">
            <div className="side-actions">
              <button type="button" onClick={() => setCreateMode("file")}>
                New file
              </button>
              <button type="button" onClick={() => setCreateMode("folder")}>
                New folder
              </button>
            </div>
            <FileTree
              vfs={vfs}
              selected={activeTab ?? folder}
              onSelectFile={openFile}
              onSelectFolder={setFolder}
            />
          </nav>
        </Panel>
        <Separator className="resize-handle" aria-label="Resize file tree" />
        <Panel id="editor" defaultSize="42%" minSize="20%" className="main-panel">
          <main className="main">
            <EditorTabs tabs={openTabs} active={activeTab} onSelect={setActiveTab} onClose={closeTab} />
            <div
              id="editor-panel"
              role="tabpanel"
              aria-labelledby={activeTab ? `tab-${activeTab}` : undefined}
              className="editor"
            >
              {activeTab ? (
                <CodeMirror
                  value={source}
                  height="100%"
                  theme="dark"
                  extensions={extensions}
                  basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                  onChange={(value) => {
                    const next = writeFile(vfs, activeTab, value);
                    if (!("error" in next)) setVfs(next);
                  }}
                  aria-label={`Code editor for ${activeTab}`}
                />
              ) : (
                <p className="hint">Open or create a .cs file to start editing.</p>
              )}
            </div>
          </main>
        </Panel>
        <Separator className="resize-handle" aria-label="Resize console" />
        <Panel id="console" defaultSize="26%" minSize="12%" className="console-panel">
          <ConsolePanel lines={lines} />
        </Panel>
      </Group>
      {saveError && (
        <div className="status" role="status">
          {saveError}
        </div>
      )}
      <CreateDialog
        open={createMode !== null}
        mode={createMode ?? "file"}
        parentLabel={folder}
        onClose={() => setCreateMode(null)}
        onCreateFile={onCreateFile}
        onCreateFolder={onCreateFolder}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Clear last session?"
        message="This removes saved files from this browser and restores the starter project."
        confirmLabel="Clear session"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearSessionStore();
          const fresh = defaultSession();
          setVfs(starterVfs());
          setOpenTabs(fresh.openTabs);
          setActiveTab(fresh.activeTab);
          setSelectedVersion(fresh.selectedVersion);
          setActiveLesson(null);
          setLines([]);
          setConfirmClear(false);
        }}
      />
    </div>
  );
}
