import path from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "../lib/store.js";
import { collectTopNotes } from "../lib/collector.js";
import { analyzeNotes } from "../lib/analyzer.js";
import { generateDraft } from "../lib/generator.js";
import { cacheNoteCovers } from "../lib/cover-cache.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const store = new Store(path.join(root, "data", "store.json"));
const data = await store.read();
const collectedGroups = await collectTopNotes({ keywords: data.settings.keywords });
const groups = await cacheNoteCovers(collectedGroups, path.join(root, "public"));
const notes = groups.flatMap((group) => group.notes.map((note, index) => ({ ...note, keyword: group.keyword, rank: index + 1 })));
if (notes.length < 5) throw new Error(`本轮仅有 ${notes.length} 篇合格素材，未达到 5 篇发布门槛，保留上一版数据`);
const run = {
  id: crypto.randomUUID(),
  collectedAt: new Date().toISOString(),
  status: notes.length ? "complete" : "partial",
  groups,
  analysis: analyzeNotes(notes),
};
await store.addRun(run);
if (notes.length) {
  for (const keyword of ["急用钱", "借钱", "贷款", "缺钱", "资金周转"]) {
    await store.addDraft(generateDraft(notes, keyword));
  }
}
console.log(JSON.stringify({ collectedAt: run.collectedAt, noteCount: notes.length, status: run.status }));
