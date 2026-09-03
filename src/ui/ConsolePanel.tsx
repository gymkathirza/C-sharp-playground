export type ConsoleLine = {
  kind: "info" | "warn" | "error" | "system";
  text: string;
};

const HINT =
  "▶ Run compiles a console app in a sandboxed browser runtime (.NET Standard 2.0). The version dropdown is for export only.";

export function ConsolePanel({ lines }: { lines: ConsoleLine[] }) {
  return (
    <section className="console" aria-labelledby="console-h">
      <h2 id="console-h">Console</h2>
      <div role="log" aria-live="polite" aria-relevant="additions" className="console-log">
        {lines.length === 0 ? (
          <p className="hint">{HINT}</p>
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
