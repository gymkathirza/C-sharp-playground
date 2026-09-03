import { prepareConsoleSource } from "./prepareCs";
import type { ConsoleLine } from "../ui/ConsolePanel";

const RUN_MS = 12_000;
const MAX_LINES = 200;

type ParentMsg = {
  type: "run";
  nonce: number;
  code: string;
};

type ChildMsg =
  | { type: "ready" }
  | { type: "console"; nonce: number; kind: ConsoleLine["kind"]; text: string }
  | { type: "done"; nonce: number };

export function prepareRun(files: Record<string, string>): { code: string } | { error: string } {
  const prepared = prepareConsoleSource(files);
  if (typeof prepared !== "string") return prepared;
  if (!prepared.trim()) return { error: "Nothing to run" };
  return { code: prepared };
}

export function mountSandbox(
  onLine: (line: ConsoleLine, nonce: number) => void,
  onReady: () => void,
  onDone: (nonce: number) => void,
): { run: (msg: ParentMsg) => void; destroy: () => void } {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.setAttribute("title", "C# execution sandbox");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.display = "none";
  iframe.src = `${import.meta.env.BASE_URL}sandbox.html`;

  let counts = new Map<number, number>();
  const onMessage = (ev: MessageEvent) => {
    if (ev.source !== iframe.contentWindow) return;
    const data = ev.data as ChildMsg;
    if (!data || typeof data !== "object") return;
    if (data.type === "ready") {
      onReady();
      return;
    }
    if (data.type === "console" && typeof data.nonce === "number") {
      const n = (counts.get(data.nonce) ?? 0) + 1;
      counts.set(data.nonce, n);
      if (n > MAX_LINES) return;
      onLine({ kind: data.kind, text: String(data.text ?? "") }, data.nonce);
    }
    if (data.type === "done" && typeof data.nonce === "number") {
      window.clearTimeout(timer);
      onDone(data.nonce);
    }
  };
  window.addEventListener("message", onMessage);
  document.body.appendChild(iframe);

  let timer = 0;
  return {
    run(msg) {
      window.clearTimeout(timer);
      counts.delete(msg.nonce);
      iframe.contentWindow?.postMessage(msg, "*");
      timer = window.setTimeout(() => {
        onLine({ kind: "error", text: `Run timed out after ${RUN_MS / 1000}s` }, msg.nonce);
        onDone(msg.nonce);
      }, RUN_MS);
    },
    destroy() {
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      iframe.remove();
    },
  };
}
