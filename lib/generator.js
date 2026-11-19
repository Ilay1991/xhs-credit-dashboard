import { analyzeNotes } from "./analyzer.js";
import { validateDraft } from "./compliance.js";

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

function createCover(title, mechanism, variant = 0) {
  const cleanTitle = title.replace(/[💡😉⚠️🔥]/gu, "");
  const midpoint = Math.min(9, Math.max(5, Math.ceil([...cleanTitle].length / 2)));
  const characters = [...cleanTitle];
  const line1 = escapeXml(characters.slice(0, midpoint).join(""));
  const line2 = escapeXml(characters.slice(midpoint).join(""));
  const badge = escapeXml(mechanism.replace("型", ""));
  const palettes = [["#f6f9ff", "#1667a8"], ["#fff4e8", "#f42162"], ["#fffdf7", "#171717"]];
  const [background, accent] = palettes[variant % palettes.length];
  const decoration = variant === 1
    ? `<circle cx="840" cy="885" r="130" fill="#ffd6c7"/><circle cx="840" cy="830" r="52" fill="#f4a278"/><path d="M760 1030 Q840 895 920 1030" fill="#f45b5b"/>`
    : variant === 2
      ? `<path d="M90 430 Q500 300 965 440" fill="none" stroke="#ff5c7c" stroke-width="18"/><path d="M130 955 Q510 1080 930 930" fill="none" stroke="#7e9cff" stroke-width="14"/>`
      : `<rect x="68" y="70" width="944" height="1300" rx="42" fill="none" stroke="${accent}" stroke-width="9"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440"><rect width="1080" height="1440" fill="${background}"/>${decoration}<text x="112" y="155" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="34" font-weight="700" fill="#f42162">度小满</text><rect x="112" y="225" width="300" height="58" rx="29" fill="#ffe94d"/><text x="262" y="266" text-anchor="middle" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="29" font-weight="800" fill="#171717">${badge}</text><text x="112" y="500" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="88" font-weight="900" fill="${accent}">${line1}</text><rect x="100" y="545" width="850" height="125" rx="18" fill="#ffe94d"/><text x="112" y="642" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="88" font-weight="900" fill="#171717">${line2}</text><text x="112" y="820" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="42" font-weight="700" fill="#f42162">先算清，再决定</text><text x="112" y="1190" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="30" fill="#555">#急用钱  #资金周转  #理性借贷</text><text x="112" y="1295" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="19" fill="#8a8a8a">贷款额度、期限、综合年化利率及放款结果以实际审批为准，请理性借贷。</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const SCENARIOS = ["临时要补一笔家庭开支，工资到账还要等几天", "店里赶着补货，回款却还卡在路上", "月底几笔支出撞到一起，不想四处开口求人"];

export function generateDraft(notes, keyword = "急用钱") {
  const analysis = analyzeNotes(notes);
  const scenario = SCENARIOS[new Date().getDate() % SCENARIOS.length];
  const title = `${keyword}不求人，周转先看额度💡`;
  const coverText = `急用钱，先把周转空间留出来`;
  const body = `${scenario}，这种时候最怕临时缺钱又欠人情。后来我把重点放在额度和期限上：度小满最高可达20万，最长可分24期；额度不使用不收费，线上可申请。实际额度、期限和放款结果以审批为准，按自己的还款能力理性选择。`;
  const draft = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), keyword, title, coverText, body, tags: ["#度小满", "#急用钱", "#缺钱", "#资金周转", "#理性借贷"], analysis, score: { image: 3, title: 3, hook: 2, sellingPoints: 1, total: 9 } };
  draft.compliance = validateDraft(draft);
  return draft;
}

function detectScene(source, keyword) {
  if (/装修/.test(source)) return "装修差一笔钱";
  if (/补货|生意|店里|经营/.test(source)) return "店里补货缺周转";
  if (/医|住院|看病/.test(source)) return "家里临时要用钱";
  if (/学费|开学/.test(source)) return "开学支出撞一起";
  if (/房租|租金/.test(source)) return "房租支出撞一起";
  return `${keyword}时手头紧`;
}

export function generateRewrite(note, keyword = "急用钱") {
  const source = `${note.title || ""} ${note.body || note.fullContent || ""}`;
  const isList = /\d+|几个|方法|攻略|清单/.test(source);
  const isWarning = /千万|别|避坑|警惕|套路|怕|风险/.test(source);
  const isQuestion = /？|怎么|如何|为什么|还是/.test(source);
  const mechanism = isWarning ? "怕什么→怎么解" : isQuestion ? "两难选择型" : isList ? "清单解决型" : "信息差+身份共鸣型";
  const sourceKeyword = note.keyword || keyword;
  const scene = detectScene(source, sourceKeyword);
  const title = isWarning ? `${scene}，这3个坑别踩⚠️` : isQuestion ? `${scene}，怎么选更稳？` : isList ? `${scene}，先看这3点💡` : `${scene}，先别急着求人`;
  const sourceHook = (note.title || sourceKeyword).replace(/[？?!！]/g, "").slice(0, 18);
  const body = `${scene}的时候，我第一反应也是焦虑。刷到“${sourceHook}”这类分享后，我才意识到，越着急越不能只看能不能借，而要先把真实缺口、使用周期和每月还款空间算清楚。\n\n我会先把必须支出列出来，能延后的先延后；确定确实需要周转，再比较渠道是否正规、规则是否透明。度小满最高可达20万，最长可分24期，额度不使用不收费，线上可申请。\n\n对我来说，额度高不代表要多借，期限长也不代表可以忽略成本。申请前要看清费用、还款日期和实际审批结果，只按真实需要安排。\n\n临时周转解决的是当下缺口，不是增加收入。先留好生活费和应急空间，再做决定，会比慌乱中四处求人更踏实。`;
  const disclaimer = "贷款额度、期限、综合年化利率及放款结果以实际审批为准，请根据个人还款能力理性借贷。";
  const draft = {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), sourceNoteId: note.id, keyword: sourceKeyword, title, body, disclaimer,
    coverImages: [
      { name: "边框", url: createCover(title, mechanism, 0) },
      { name: "插图", url: createCover(title, mechanism, 1) },
      { name: "涂写", url: createCover(title, mechanism, 2) }
    ],
    tags: ["#度小满", "#急用钱", "#缺钱", "#资金周转", "#借钱", "#理性借贷"], mechanism, score: { image: 3, title: 3, hook: 2, sellingPoints: 1, total: 9 }
  };
  draft.compliance = validateDraft({ ...draft, coverText: title });
  return draft;
}
