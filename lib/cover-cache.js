import fs from "node:fs/promises";
import path from "node:path";

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

async function writeFallbackCover(note, coverDir) {
  for (const extension of ["webp", "jpg", "png"]) {
    const existing = `${note.id}.${extension}`;
    try {
      await fs.access(path.join(coverDir, existing));
      note.cover = `/note-covers/${existing}`;
      return;
    } catch {}
  }
  const filename = `${note.id || crypto.randomUUID()}.svg`;
  const characters = [...(note.title || "小红书爆款笔记")];
  const lines = [characters.slice(0, 10).join(""), characters.slice(10, 20).join(""), characters.slice(20, 30).join("")].filter(Boolean);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440"><rect width="1080" height="1440" fill="#fff7fa"/><rect x="64" y="64" width="952" height="1312" rx="44" fill="none" stroke="#f42162" stroke-width="10"/><text x="110" y="180" font-family="PingFang SC,sans-serif" font-size="38" font-weight="700" fill="#f42162">原爆款首图</text>${lines.map((line, index) => `<text x="110" y="${470 + index * 150}" font-family="PingFang SC,sans-serif" font-size="82" font-weight="900" fill="#20242a">${escapeXml(line)}</text>`).join("")}<text x="110" y="1260" font-family="PingFang SC,sans-serif" font-size="28" fill="#7b8190">图片外链失效时的本地标题预览</text></svg>`;
  await fs.writeFile(path.join(coverDir, filename), svg);
  note.cover = `/note-covers/${filename}`;
}

export async function cacheNoteCovers(groups, publicDir) {
  const coverDir = path.join(publicDir, "note-covers");
  await fs.mkdir(coverDir, { recursive: true });
  const notes = groups.flatMap((group) => group.notes || []);
  const pending = notes.filter((note) => note.cover && !note.cover.includes("note-covers/"));
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < pending.length) {
      const note = pending[nextIndex++];
      try {
        const response = await fetch(note.cover, { headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.xiaohongshu.com/" }, signal: AbortSignal.timeout(10000) });
        if (!response.ok) { await writeFallbackCover(note, coverDir); continue; }
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const filename = `${note.id || crypto.randomUUID()}.${extension}`;
        await fs.writeFile(path.join(coverDir, filename), Buffer.from(await response.arrayBuffer()));
        note.cover = `/note-covers/${filename}`;
      } catch (error) {
        console.warn(`Cover cache failed for ${note.id}: ${error.message}`);
        await writeFallbackCover(note, coverDir);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(6, pending.length) }, worker));
  return groups;
}
