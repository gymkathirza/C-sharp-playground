import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/csharp-wasm-runner/runtime");
const dest = join(root, "public/csharp-runtime");

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`copied csharp-runtime -> ${dest}`);
