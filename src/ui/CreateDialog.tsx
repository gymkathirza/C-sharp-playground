import { useRef, useState } from "react";
import { CS_EXTS, type CsFileExt } from "../lib/paths";
import { useFocusTrap } from "./useFocusTrap";

type Mode = "file" | "folder";

type Props = {
  open: boolean;
  mode: Mode;
  parentLabel: string;
  onClose: () => void;
  onCreateFile: (name: string, ext: CsFileExt) => string | null;
  onCreateFolder: (name: string) => string | null;
};

export function CreateDialog({
  open,
  mode,
  parentLabel,
  onClose,
  onCreateFile,
  onCreateFolder,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [ext, setExt] = useState<CsFileExt>("cs");
  const [error, setError] = useState<string | null>(null);
  useFocusTrap(open, ref, onClose);
  if (!open) return null;

  const submit = () => {
    const err = mode === "file" ? onCreateFile(name.trim(), ext) : onCreateFolder(name.trim());
    if (err) {
      setError(err);
      return;
    }
    setName("");
    setError(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <h2 id="create-title">{mode === "file" ? "New file" : "New folder"}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <p className="hint">In {parentLabel || "project root"}. Name only — no extension or slashes.</p>
        <label className="stack-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {mode === "file" && (
          <label className="stack-field">
            <span>File type</span>
            <select value={ext} onChange={(e) => setExt(e.target.value as CsFileExt)} aria-label="File extension">
              {CS_EXTS.map((item) => (
                <option key={item} value={item}>
                  .{item}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={submit}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
