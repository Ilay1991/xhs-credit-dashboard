import fs from "node:fs/promises";
import path from "node:path";

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
        if (!response.ok) continue;
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const filename = `${note.id || crypto.randomUUID()}.${extension}`;
        await fs.writeFile(path.join(coverDir, filename), Buffer.from(await response.arrayBuffer()));
        note.cover = `/note-covers/${filename}`;
      } catch (error) {
        console.warn(`Cover cache failed for ${note.id}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(6, pending.length) }, worker));
  return groups;
}
