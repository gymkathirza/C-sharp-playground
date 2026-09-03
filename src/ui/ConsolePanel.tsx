export type ConsoleLine = {
  kind: "info" | "warn" | "error" | "system";
  text: string;
};

const PHASE1_HINT =
  "▶ Run is not yet available in the browser. Export your project and run with `dotnet run`.";

export function ConsolePanel({ lines }: { lines: ConsoleLine[] }) {
  return (
    <section className="console" aria-labelledby="console-h">
      <h2 id="console-h">Console</h2>
      <div role="log" aria-live="polite" aria-relevant="additions" className="console-log">
        {lines.length === 0 ? (
          <p className="hint">{PHASE1_HINT}</p>
        ) : (
          lines.map((line, i) => (
            <p key={i} className={`line ${line.kind}`}>
              {line.text}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
