import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const output = path.join(publicDir, '爆款分析工作台.html');

const [index, styles, appSource, features, stateText] = await Promise.all([
  fs.readFile(path.join(publicDir, 'index.html'), 'utf8'),
  fs.readFile(path.join(publicDir, 'styles.css'), 'utf8'),
  fs.readFile(path.join(publicDir, 'app.js'), 'utf8'),
  fs.readFile(path.join(publicDir, 'features.js'), 'utf8'),
  fs.readFile(path.join(root, 'data', 'store.json'), 'utf8'),
]);

const state = JSON.parse(stateText);
const snapshot = {
  running: false,
  runs: state.runs || [],
  drafts: state.drafts || [],
};

const offlineApi = `async function api(path,opt={}){
  if(path==="/api/state") return window.__SNAPSHOT_STATE__;
  throw Error("离线快照仅支持浏览；更新、仿写和评论分析请打开在线版");
}`;
const app = appSource.replace(/async function api\(path,opt=\{\}\)\{.*?return b\}/s, offlineApi);

const embeddedScripts = `<script>window.__SNAPSHOT_STATE__=${JSON.stringify(snapshot).replace(/<\/script/gi, '<\\/script')};</script><script type="module">${app}</script><script type="module">${features}</script>`;
let html = index
  .replace('<link rel="stylesheet" href="/styles.css">', () => `<style>${styles}</style>`)
  .replace('<script type="module" src="/app.js"></script><script type="module" src="/features.js"></script>', () => embeddedScripts)
  .replace('每日 10:00 自动更新', '离线快照 · 下载后可直接打开')
  .replace('立即更新</button>', '在线版更新</button>');

await fs.writeFile(output, html);
console.log(output);
