import fs from "node:fs/promises";
import path from "node:path";
import { dedupeGroups, isHotNote, matchesEditorialRules } from "../lib/collector.js";

const storePath = path.resolve(import.meta.dirname, "../data/store.json");
const data = JSON.parse(await fs.readFile(storePath, "utf8"));
data.runs.sort((left, right) => new Date(right.collectedAt || 0) - new Date(left.collectedAt || 0));
const latestRun = data.runs[0];
if (!latestRun) throw new Error("没有可清理的采集快照");

latestRun.groups = dedupeGroups(
  latestRun.groups.map((group) => ({
    ...group,
    notes: (group.notes || []).filter((note) => matchesEditorialRules(note, group.keyword) && isHotNote(note)),
  })),
);

await fs.writeFile(storePath, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify(latestRun.groups.map((group) => ({ keyword: group.keyword, count: group.notes.length }))));
