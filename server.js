import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import { Store } from "./lib/store.js";
import { collectNoteComments, collectTopNotes, openLoginBrowser } from "./lib/collector.js";
import { analyzeNotes } from "./lib/analyzer.js";
import { generateDraft, generateRewrite } from "./lib/generator.js";
import { scheduleDaily } from "./lib/scheduler.js";
import { cacheNoteCovers } from "./lib/cover-cache.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const store = new Store(path.join(root, "data", "store.json"));
const profilePath = path.join(root, "data", "browser-profile");
const app = express();
let running = false;
let loginContext;
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(root, "public")));

async function runCollection({ headless = false } = {}) {
  if (running) throw new Error("采集任务正在运行");
  running = true;
  try {
    if (loginContext) {
      const context = loginContext;
      loginContext = undefined;
      await context.close();
    }
    const data = await store.read();
    const collectedGroups = await collectTopNotes({ keywords: data.settings.keywords, profilePath, headless });
    const groups = await cacheNoteCovers(collectedGroups, path.join(root, "public"));
    const notes = groups.flatMap((group) => group.notes.map((note, index) => ({ ...note, keyword: group.keyword, rank: index + 1 })));
    const run = {
      id: crypto.randomUUID(),
      collectedAt: new Date().toISOString(),
      status: notes.length ? "complete" : "partial",
      groups,
      analysis: analyzeNotes(notes)
    };
    await store.addRun(run);
    if (notes.length) {
      const draftKeywords = ["急用钱", "借钱", "贷款", "缺钱", "资金周转"];
      for (const keyword of draftKeywords) await store.addDraft(generateDraft(notes, keyword));
    }
    return run;
  } finally {
    running = false;
  }
}

app.get("/api/state", async (_request, response) => {
  const data = await store.read();
  response.json({ ...data, running, loginWindowOpen: Boolean(loginContext) });
});

app.post("/api/login/open", async (_request, response, next) => {
  try {
    if (!loginContext) {
      const opened = await openLoginBrowser(profilePath);
      loginContext = opened.context;
      loginContext.on("close", () => { loginContext = undefined; });
    }
    response.json({ ok: true, message: "登录窗口已打开，完成登录后可直接关闭窗口" });
  } catch (error) { next(error); }
});

app.post("/api/collect", async (_request, response, next) => {
  try { response.json(await runCollection()); } catch (error) { next(error); }
});

app.get("/api/notes/:noteId/comments", async (request, response, next) => {
  try { response.json(await collectNoteComments(request.params.noteId)); } catch (error) { next(error); }
});

app.post("/api/notes/:noteId/rewrite", async (request, response, next) => {
  try {
    const data = await store.read();
    const note = data.runs.flatMap((run) => run.groups.flatMap((group) => group.notes)).find((item) => item.id === request.params.noteId);
    if (!note) return response.status(404).json({ error: "未找到原始笔记" });
    response.json(generateRewrite(note, note.keyword || request.body.keyword || "急用钱"));
  } catch (error) { next(error); }
});

app.post("/api/runs/manual", async (request, response, next) => {
  try {
    const groups = request.body.groups || [];
    const notes = groups.flatMap((group) => group.notes.map((note, index) => ({ ...note, keyword: group.keyword, rank: index + 1 })));
    const run = { id: crypto.randomUUID(), collectedAt: new Date().toISOString(), status: "manual", groups, analysis: analyzeNotes(notes) };
    await store.addRun(run);
    response.json(run);
  } catch (error) { next(error); }
});

app.post("/api/generate", async (request, response, next) => {
  try {
    const data = await store.read();
    const notes = data.runs[0]?.groups.flatMap((group) => group.notes) || [];
    if (!notes.length) return response.status(400).json({ error: "请先采集或补录笔记" });
    const draft = generateDraft(notes, request.body.keyword || "急用钱");
    await store.addDraft(draft);
    response.json(draft);
  } catch (error) { next(error); }
});

app.post("/api/generate-batch", async (_request, response, next) => {
  try {
    const data = await store.read();
    const notes = data.runs[0]?.groups.flatMap((group) => group.notes) || [];
    if (!notes.length) return response.status(400).json({ error: "请先采集或补录笔记" });
    const keywords = ["急用钱", "借钱", "贷款", "缺钱", "资金周转"];
    const drafts = keywords.map((keyword) => generateDraft(notes, keyword));
    for (const draft of drafts) await store.addDraft(draft);
    response.json(drafts);
  } catch (error) { next(error); }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: error.message || "服务器错误" });
});

scheduleDaily(() => runCollection().catch((error) => console.error("Scheduled collection failed:", error)));

const port = Number(process.env.PORT || 4173);
app.listen(port, "0.0.0.0", () => console.log(`XHS dashboard: http://0.0.0.0:${port}`));
