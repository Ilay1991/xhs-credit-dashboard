import fs from "node:fs/promises";
import path from "node:path";
import { matchesEditorialRules, selectFirstUniqueNotePerGroup } from "../lib/collector.js";

const storePath = path.resolve(import.meta.dirname, "../data/store.json");
const data = JSON.parse(await fs.readFile(storePath, "utf8"));
data.runs.sort((left, right) => new Date(right.collectedAt || 0) - new Date(left.collectedAt || 0));
const latestRun = data.runs[0];
if (!latestRun) throw new Error("没有可清理的采集快照");
const coverDir = path.resolve(import.meta.dirname, "../public/note-covers");

async function restoreRealCover(note) {
  if (!note.id || !String(note.cover || "").endsWith(".svg")) return note;
  for (const extension of ["webp", "jpg", "png"]) {
    try {
      await fs.access(path.join(coverDir, `${note.id}.${extension}`));
      return { ...note, cover: `/note-covers/${note.id}.${extension}` };
    } catch {}
  }
  return note;
}

latestRun.groups = selectFirstUniqueNotePerGroup(
  await Promise.all(latestRun.groups.map(async (group) => ({
    ...group,
    notes: await Promise.all((group.notes || []).filter((note) => matchesEditorialRules(note, group.keyword)).map(restoreRealCover)),
  }))),
);

await fs.writeFile(storePath, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify(latestRun.groups.map((group) => ({ keyword: group.keyword, count: group.notes.length }))));
