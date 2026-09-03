export type ChannelStatus = "stable" | "preview";

export type Channel = {
  id: string;
  sdk: string;
  language: string;
  status: ChannelStatus;
  enabled: boolean;
  verifiedAt: string | null;
};

export type VersionManifest = {
  schemaVersion: number;
  generatedAt: string;
  channels: Channel[];
};

export function parseManifest(raw: unknown): VersionManifest | { error: string } {
  if (typeof raw !== "object" || raw === null) return { error: "Invalid manifest" };
  const obj = raw as Record<string, unknown>;
  if (obj["schemaVersion"] !== 1) return { error: "Unsupported schema version" };
  if (!Array.isArray(obj["channels"])) return { error: "Missing channels" };
  const channels: Channel[] = [];
  for (const ch of obj["channels"] as unknown[]) {
    if (typeof ch !== "object" || ch === null) continue;
    const c = ch as Record<string, unknown>;
    if (
      typeof c["id"] !== "string" ||
      typeof c["sdk"] !== "string" ||
      typeof c["language"] !== "string" ||
      typeof c["status"] !== "string" ||
      typeof c["enabled"] !== "boolean"
    ) continue;
    channels.push({
      id: c["id"],
      sdk: c["sdk"],
      language: c["language"],
      status: c["status"] as ChannelStatus,
      enabled: c["enabled"],
      verifiedAt: typeof c["verifiedAt"] === "string" ? c["verifiedAt"] : null,
    });
  }
  return {
    schemaVersion: 1,
    generatedAt: typeof obj["generatedAt"] === "string" ? obj["generatedAt"] : "",
    channels,
  };
}

export function enabledChannels(manifest: VersionManifest): Channel[] {
  return manifest.channels.filter((c) => c.enabled);
}

export function findChannel(manifest: VersionManifest, id: string): Channel | undefined {
  return manifest.channels.find((c) => c.id === id);
}

export function applyChannelToCsproj(content: string, channel: Channel): string {
  return content
    .replace(/<TargetFramework>net[^<]*<\/TargetFramework>/, `<TargetFramework>net${channel.sdk}</TargetFramework>`)
    .replace(/<LangVersion>[^<]*<\/LangVersion>/, `<LangVersion>${channel.language}</LangVersion>`);
}
