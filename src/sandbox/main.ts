import CSharpBrowserCompiler, { type CompilerOptions } from "csharp-wasm-runner";

const runtime = `${import.meta.env.BASE_URL}csharp-runtime/`;

type HostOptions = CompilerOptions & { basePath?: string };

const compiler = new CSharpBrowserCompiler({
  autoInit: true,
  basePath: runtime,
  monoConfig: `${runtime}mono-config.js`,
  runtimeJs: `${runtime}runtime.js`,
  dotnetJs: `${runtime}dotnet.js`,
  dotnetWasm: `${runtime}dotnet.wasm`,
  assembliesPath: `${runtime}managed/`,
  onReady: () => parent.postMessage({ type: "ready" }, "*"),
  onError: (error) => {
    parent.postMessage({ type: "console", nonce: 0, kind: "error", text: String(error) }, "*");
  },
} as HostOptions);

function send(type: string, nonce: number, extra: Record<string, unknown> = {}) {
  parent.postMessage({ type, nonce, ...extra }, "*");
}

window.addEventListener("message", async (ev) => {
  const data = ev.data as { type?: string; nonce?: number; code?: string };
  if (!data || data.type !== "run" || typeof data.nonce !== "number" || typeof data.code !== "string") {
    return;
  }
  const nonce = data.nonce;
  try {
    const result = await compiler.run(data.code);
    if (!result.success) {
      for (const line of result.compileLog ?? []) {
        if (line.trim()) send("console", nonce, { kind: "error", text: line });
      }
      if (result.error) send("console", nonce, { kind: "error", text: result.error });
      send("done", nonce);
      return;
    }
    for (const line of result.output ?? []) {
      send("console", nonce, { kind: "info", text: line });
    }
    if ((result.output ?? []).length === 0) {
      send("console", nonce, { kind: "system", text: "Program finished with no console output." });
    }
    send("done", nonce);
  } catch (err) {
    send("console", nonce, { kind: "error", text: err instanceof Error ? err.message : String(err) });
    send("done", nonce);
  }
});
