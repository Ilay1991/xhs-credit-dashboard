import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
try {
  await fs.access(path.join(root, "data", "store.json"));
  await import("./export-html-snapshot.mjs");
} catch {
  console.log("Runtime data unavailable; using committed snapshot");
}
await fs.mkdir(path.join(root, "docs"), { recursive: true });
await fs.copyFile(path.join(root, "public", "爆款分析工作台.html"), path.join(root, "docs", "index.html"));
await fs.writeFile(path.join(root, "docs", ".nojekyll"), "");
console.log("GitHub Pages snapshot built");
