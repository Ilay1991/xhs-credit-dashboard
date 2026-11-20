import { analyzeNotes } from "./analyzer.js";
import { validateDraft } from "./compliance.js";
import { readFileSync } from "node:fs";

const LOGO_URI = `data:image/png;base64,${readFileSync(new URL("../public/cover-assets/logo.png", import.meta.url)).toString("base64")}`;
const COVER_TEMPLATES = [
  "急用钱换搭配", "急用钱提问", "插图", "美漫", "弥散",
  "几何", "清新", "书摘", "科技", "柔和",
  "备忘", "边框", "涂写", "手写", "便签"
];

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
}

function createCover(title, mechanism, templateName) {
  const cleanTitle = title.replace(/[💡😉⚠️🔥]/gu, "");
  const midpoint = Math.min(9, Math.max(5, Math.ceil([...cleanTitle].length / 2)));
  const characters = [...cleanTitle];
  const line1 = escapeXml(characters.slice(0, midpoint).join(""));
  const line2 = escapeXml(characters.slice(midpoint).join(""));
  const badge = escapeXml(mechanism.replace("型", ""));
  const template = {
    "急用钱换搭配": ["#fff8f8", "#e72b5f", `<rect x="48" y="42" width="984" height="1310" rx="34" fill="none" stroke="#e72b5f" stroke-width="12"/><text x="820" y="1040" font-size="118">👚</text>`],
    "急用钱提问": ["#fff1f5", "#d4215d", `<text x="820" y="1050" font-size="180">🤔</text><text x="855" y="865" font-size="520" font-weight="900" fill="#d4215d" opacity=".08">?</text>`],
    "插图": ["#fff3e8", "#ef3164", `<circle cx="830" cy="960" r="118" fill="#ffd2bf"/><circle cx="830" cy="900" r="48" fill="#f09b70"/><path d="M750 1080q80-150 160 0" fill="#ef5a63"/><circle cx="710" cy="830" r="70" fill="none" stroke="#333" stroke-width="14"/><line x1="760" y1="880" x2="810" y2="930" stroke="#333" stroke-width="14"/>`],
    "美漫": ["#fff2cf", "#1d1d1d", `<path d="M730 820l48 80 96-34-28 94 86 54-102 18-4 104-70-74-84 62 10-104-100-30 92-44-34-96 90 50z" fill="#ff4f6d" stroke="#111" stroke-width="8"/><text x="755" y="1018" font-size="62" font-weight="900">WOW!</text>`],
    "弥散": ["#f4e9ff", "#6a44a1", `<defs><radialGradient id="g"><stop stop-color="#ff75ac" stop-opacity=".55"/><stop offset="1" stop-color="#8e77ff" stop-opacity="0"/></radialGradient></defs><circle cx="850" cy="330" r="320" fill="url(#g)"/><text x="820" y="1050" font-size="150">🪙</text>`],
    "几何": ["#cfead7", "#145f43", `<rect x="760" y="210" width="190" height="190" fill="#ffe94d"/><circle cx="860" cy="940" r="120" fill="#ff8fa9"/><path d="M690 1120l170-220 170 220z" fill="#7392ff"/>`],
    "清新": ["#f6f0df", "#2d6b4d", `<path d="M860 210c0 130-50 210-140 280M855 270c-80-10-130 30-160 90M830 355c-65 0-105 30-135 75" fill="none" stroke="#69a47d" stroke-width="12"/><circle cx="870" cy="1010" r="105" fill="#f4d76e" opacity=".7"/>`],
    "书摘": ["#fffdf8", "#30291f", `<path d="M700 890q100-55 200 0v210q-100-55-200 0zM900 890q100-55 150 0v210q-50-55-150 0z" fill="#f4ead2" stroke="#7d6b54" stroke-width="6"/><text x="785" y="970" font-family="Songti SC,serif" font-size="36">摘录</text>`],
    "科技": ["#101722", "#4bd5ff", `<path d="M0 250H1080M0 500H1080M0 750H1080M220 0v1180M520 0v1180M820 0v1180" stroke="#29405e" stroke-width="3"/><circle cx="860" cy="920" r="120" fill="none" stroke="#4bd5ff" stroke-width="9"/><path d="M780 920h160M860 840v160" stroke="#4bd5ff" stroke-width="6"/>`],
    "柔和": ["#eaf4ff", "#416b93", `<path d="M40 1080c210-110 370 80 560-25M700 1110h320M800 1150h220" fill="none" stroke="#78a7d5" stroke-width="8" stroke-linecap="round"/><circle cx="900" cy="280" r="110" fill="#c7ddf3"/>`],
    "备忘": ["#fff8ce", "#8a6420", `<rect x="610" y="230" width="350" height="420" rx="12" fill="#fff2a8" transform="rotate(5 610 230)"/><text x="680" y="350" font-size="52" font-weight="800">NOTE</text><path d="M780 220q70-90 130 0v150q0 65-65 65t-65-65V250" fill="none" stroke="#777" stroke-width="12"/>`],
    "边框": ["#f6f9ff", "#1667a8", `<rect x="52" y="50" width="976" height="1325" rx="42" fill="none" stroke="#1667a8" stroke-width="10"/>`],
    "涂写": ["#fffdf7", "#171717", `<path d="M80 410q430-120 930 20M120 1000q420 120 830-30" fill="none" stroke="#ff5c7c" stroke-width="18"/><path d="M180 1110q360 80 720-20" fill="none" stroke="#7896ff" stroke-width="14"/>`],
    "手写": ["#fffaf0", "#5b493c", `<path d="M60 330H1020M60 410H1020M60 490H1020M60 570H1020M60 650H1020M60 730H1020M60 810H1020M60 890H1020M60 970H1020M60 1050H1020" stroke="#8c7c6c" stroke-width="2" opacity=".18"/><text x="790" y="1110" font-size="44" font-style="italic">2026 / NOTE</text>`],
    "便签": ["#ece7dc", "#443b31", `<rect x="105" y="260" width="870" height="840" rx="12" fill="#fff" transform="rotate(-1 540 680)"/><rect x="720" y="210" width="220" height="160" fill="#ffe56b" transform="rotate(6 720 210)"/><path d="M515 230v-90h110v90" fill="none" stroke="#777" stroke-width="12"/>`]
  }[templateName] || ["#fff", "#222", ""];
  const [background, accent, decoration] = template;
  const titleColor = templateName === "科技" ? "#f7fbff" : accent;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440"><rect width="1080" height="1440" fill="${background}"/>${decoration}<defs><clipPath id="logoClip"><rect width="120" height="120" rx="28"/></clipPath></defs><g transform="translate(56 52)"><image href="${LOGO_URI}" width="120" height="120" clip-path="url(#logoClip)"/></g><rect x="190" y="78" width="310" height="58" rx="29" fill="#ffe94d"/><text x="345" y="119" text-anchor="middle" font-family="PingFang SC,sans-serif" font-size="28" font-weight="800" fill="#171717">${badge}</text><rect x="112" y="315" width="230" height="72" rx="12" fill="#ffe94d"/><text x="227" y="365" text-anchor="middle" font-family="PingFang SC,sans-serif" font-size="36" font-weight="900" fill="#171717">急用钱</text><text x="92" y="535" font-family="PingFang SC,sans-serif" font-size="92" font-weight="900" fill="${titleColor}">${line1}</text><text x="92" y="675" font-family="PingFang SC,sans-serif" font-size="92" font-weight="900" fill="${titleColor}">${line2}</text><text x="92" y="790" font-family="PingFang SC,sans-serif" font-size="42" font-weight="700" fill="${templateName === "科技" ? "#4bd5ff" : "#e72b5f"}">先算清，再决定</text><text x="540" y="1260" text-anchor="middle" font-family="PingFang SC,sans-serif" font-size="19" fill="${titleColor}" opacity=".58">年化利率（单利）7.2%-24%，贷款额度、放款时间、还款方式、还款期限等以实际审批结果为准</text><text x="540" y="1295" text-anchor="middle" font-family="PingFang SC,sans-serif" font-size="19" fill="${titleColor}" opacity=".58">贷款有风险，借款需谨慎，请根据个人能力合理贷款，理性消费，避免逾期</text><text x="540" y="1330" text-anchor="middle" font-family="PingFang SC,sans-serif" font-size="19" fill="${titleColor}" opacity=".58">服务来源于重庆度小满小额贷款有限公司及合作金融机构，服务网址 https://www.duxiaoman.com</text></svg>`;
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
  if (/热水器/.test(source)) return "热水器突然坏了要换新";
  if (/马桶/.test(source)) return "马桶坏了急着换";
  if (/水管/.test(source)) return "家里水管突然爆了";
  if (/轮胎/.test(source)) return "轮胎到期必须换";
  if (/装修/.test(source)) return "装修差一笔钱";
  if (/补货|生意|店里|经营/.test(source)) return "店里补货缺周转";
  if (/医|住院|看病/.test(source)) return "家里临时要用钱";
  if (/学费|开学/.test(source)) return "开学支出撞一起";
  if (/房租|租金/.test(source)) return "房租支出撞一起";
  if (/急用钱|缺钱|借钱|资金周转|贷款/.test(keyword)) return `${keyword}时手头紧`;
  return "临时用钱时手头紧";
}

function detectSourceSignals(source) {
  const signals = [];
  if (/父母|家人|朋友|求人|开口/.test(source)) signals.push("人情压力");
  if (/装修|补货|房租|学费|住院|看病/.test(source)) signals.push("具体资金场景");
  if (/千万|别|避坑|警惕|套路|风险/.test(source)) signals.push("风险警示");
  if (/？|怎么|如何|为什么|还是/.test(source)) signals.push("问题式钩子");
  if (/\d+|几个|方法|攻略|清单/.test(source)) signals.push("清单结构");
  return signals.length ? signals : ["身份共鸣", "信息差"];
}

export function generateRewrite(note, keyword = "急用钱") {
  const source = `${note.title || ""} ${note.body || note.fullContent || ""}`;
  const isList = /\d+|几个|方法|攻略|清单/.test(source);
  const isWarning = /千万|别|避坑|警惕|套路|怕|风险/.test(source);
  const isQuestion = /？|怎么|如何|为什么|还是/.test(source);
  const mechanism = isWarning ? "怕什么→怎么解" : isQuestion ? "两难选择型" : isList ? "清单解决型" : "信息差+身份共鸣型";
  const sourceKeyword = note.keyword || keyword;
  const scene = detectScene(source, sourceKeyword);
  const sourceSignals = detectSourceSignals(source);
  const sceneLabel = scene.replace(/突然|要换新|急着|必须/, "").slice(0, 8);
  const titlePrefix = /(急用钱|缺钱|借钱|资金周转|贷款|手头紧)/.test(sceneLabel) ? sceneLabel : `${sceneLabel}急用钱`;
  const title = isWarning ? `${titlePrefix}，3点先看清` : isQuestion ? `${titlePrefix}，怎么周转？` : isList ? `${titlePrefix}，先看3点` : `${titlePrefix}，我先算笔账`;
  const sourceHook = (note.title || sourceKeyword).replace(/[？?!！]/g, "").slice(0, 10);
  const body = `${scene}时，这笔支出不能一直拖。看到“${sourceHook}”这类经历后，我没有先四处求人，而是先问清价格，算出真实缺口，再看工资到账前需要周转多久。\n\n确认有缺口后，我才比较正规渠道和规则。度小满最高可达20万，最长可分24期，额度不使用不收费，线上可申请；实际额度和期限以审批为准。\n\n我只按${sceneLabel}这件事的实际金额安排，没有因为额度更高就多借。临时周转解决的是眼前支出，不是增加收入，还款日和生活费也要提前留出。`;
  const disclaimer = "贷款额度、期限、综合年化利率及放款结果以实际审批为准，请根据个人还款能力理性借贷。";
  const draft = {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), sourceNoteId: note.id, keyword: sourceKeyword, title, body, disclaimer,
    coverImages: COVER_TEMPLATES.map(name => ({ name, url: createCover(title, mechanism, name) })),
    tags: ["#度小满", "#急用钱", "#缺钱", "#资金周转", "#借钱", "#理性借贷"],
    mechanism,
    sourceTitle: note.title || "原爆款笔记",
    sourceSignals,
    adaptation: {
      scene,
      sourceAnchor: scene,
      hook: `${sourceSignals.join(" + ")} → ${mechanism}`,
      structure: "原爆款冲突/疑问 → 用户真实缺口 → 信贷判断标准 → 度小满信息承接 → 理性借贷提示",
      skillRules: ["标题前置搜索意图", "正文170-220字", "非低价合规", "额度期限规范表达", "不复制原文句式"]
    },
    score: { image: 3, title: 3, hook: 2, sellingPoints: 1, total: 9 }
  };
  draft.compliance = validateDraft({ ...draft, coverText: title });
  return draft;
}
