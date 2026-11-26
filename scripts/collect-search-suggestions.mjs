import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, "public", "search-demand.json");
const seeds = ["借钱", "贷款", "急用钱"];

async function getApiKey() {
  if (process.env.TIKHUB_API_KEY) return process.env.TIKHUB_API_KEY;
  const { stdout } = await execFileAsync("security", ["find-generic-password", "-s", "xhs-credit-dashboard.tikhub", "-w"]);
  return stdout.trim();
}

async function fetchSuggestions(keyword, apiKey) {
  const url = new URL("/api/v1/xiaohongshu/web_v3/fetch_search_suggest", "https://api.tikhub.io");
  url.searchParams.set("keyword", keyword);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  const payload = await response.json();
  if (!response.ok || !payload.data?.data?.sug_items) throw new Error(`${keyword}: ${payload.message_zh || payload.message || "联想词采集失败"}`);
  return payload.data.data.sug_items.map((item) => item.text).filter(Boolean);
}

const apiKey = await getApiKey();
const results = Object.fromEntries(await Promise.all(seeds.map(async (seed) => [seed, await fetchSuggestions(seed, apiKey)])));
let state = { seeds, snapshots: [] };
try { state = JSON.parse(await fs.readFile(output, "utf8")); } catch {}
state.seeds = seeds;
state.snapshots = [{ collectedAt: new Date().toISOString(), results }, ...(state.snapshots || [])].slice(0, 90);
await fs.writeFile(output, `${JSON.stringify(state, null, 2)}\n`);
console.log(`已采集 ${seeds.length} 个种子词，共 ${Object.values(results).flat().length} 条搜索联想词`);
