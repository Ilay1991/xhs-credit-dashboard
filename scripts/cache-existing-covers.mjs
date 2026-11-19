import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cacheNoteCovers } from "../lib/cover-cache.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const storePath = path.join(root, "data", "store.json");
const data = JSON.parse(await fs.readFile(storePath, "utf8"));
const latestRun = data.runs?.[0];
if (latestRun) await cacheNoteCovers(latestRun.groups || [], path.join(root, "public"));
await fs.writeFile(storePath, JSON.stringify(data, null, 2));
console.log("Latest covers cached");
