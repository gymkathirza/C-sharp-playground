import type { Channel } from "../lib/versions";

type Props = {
  channels: Channel[];
  selected: string;
  onChange: (id: string) => void;
};

export function VersionSelector({ channels, selected, onChange }: Props) {
  return (
    <label className="version-label">
      <span>C# version</span>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select C# version channel"
      >
        {channels.map((ch) => (
          <option key={ch.id} value={ch.id}>
            .NET {ch.sdk} / C# {ch.language}
            {ch.status === "preview" ? " (preview)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
