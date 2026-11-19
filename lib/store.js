import fs from "node:fs/promises";
import path from "node:path";

const EMPTY_DATA = { runs: [], drafts: [], settings: { platform: "xiaohongshu", keywords: ["借呗", "京东金条", "借钱", "急用钱", "贷款", "资金周转"], schedule: "30 10 * * 1-5", timezone: "Asia/Shanghai", dailyDraftCount: 5 } };

export class Store {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      const data = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      data.runs ||= [];
      data.runs.sort((left, right) => new Date(right.collectedAt || 0) - new Date(left.collectedAt || 0));
      data.drafts ||= [];
      data.settings = { ...EMPTY_DATA.settings, ...(data.settings || {}) };
      data.settings.keywords = EMPTY_DATA.settings.keywords;
      data.settings.schedule = EMPTY_DATA.settings.schedule;
      data.settings.dailyDraftCount = EMPTY_DATA.settings.dailyDraftCount;
      return data;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await this.write(EMPTY_DATA);
      return structuredClone(EMPTY_DATA);
    }
  }

  async write(data) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    await fs.writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`);
    await fs.rename(temporaryPath, this.filePath);
  }

  async addRun(run) {
    const data = await this.read();
    data.runs.unshift(run);
    data.runs = data.runs.slice(0, 90);
    await this.write(data);
    return run;
  }

  async addDraft(draft) {
    const data = await this.read();
    data.drafts.unshift(draft);
    data.drafts = data.drafts.slice(0, 90);
    await this.write(data);
    return draft;
  }
}
