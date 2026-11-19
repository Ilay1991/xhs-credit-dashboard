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
  const palettes = [["#f6f9ff", "#1667a8"], ["#fff4e8", "#f42162"], ["#fffdf7", "#171717"], ["#fff8cf", "#e56a35"], ["#fff0f5", "#c72c61"], ["#fff7f0", "#7d5b4f"], ["#f2efff", "#6549b8"], ["#111722", "#4bd5ff"], ["#effff8", "#21845b"]];
  const [background, accent] = palettes[variant % palettes.length];
  const decoration = variant === 1
    ? `<circle cx="840" cy="885" r="130" fill="#ffd6c7"/><circle cx="840" cy="830" r="52" fill="#f4a278"/><path d="M760 1030 Q840 895 920 1030" fill="#f45b5b"/>`
    : variant === 2
      ? `<path d="M90 430 Q500 300 965 440" fill="none" stroke="#ff5c7c" stroke-width="18"/><path d="M130 955 Q510 1080 930 930" fill="none" stroke="#7e9cff" stroke-width="14"/>`
      : variant === 3 ? `<rect x="650" y="255" width="300" height="360" rx="18" fill="#fff2a8" transform="rotate(5 650 255)"/><text x="710" y="350" font-size="42" fill="#8a6420">NOTE</text>`
      : variant === 4 ? `<circle cx="835" cy="330" r="145" fill="#ffd6e4"/><text x="835" y="390" text-anchor="middle" font-size="190" fill="#f42162">?</text>`
      : variant === 5 ? `<circle cx="850" cy="350" r="180" fill="#ffe1d1" opacity=".7"/><circle cx="900" cy="950" r="260" fill="#ffe9ef" opacity=".8"/>`
      : variant === 6 ? `<path d="M730 210h230v230H730z" fill="#ffe94d"/><circle cx="850" cy="850" r="130" fill="#ff91b1"/><path d="M690 1080l170-210 170 210z" fill="#7e9cff"/>`
      : variant === 7 ? `<path d="M0 260H1080M0 520H1080M0 780H1080M220 0v1180M520 0v1180M820 0v1180" stroke="#29405e" stroke-width="3"/><circle cx="865" cy="300" r="115" fill="none" stroke="#4bd5ff" stroke-width="8"/>`
      : variant === 8 ? `<path d="M0 1080 Q270 900 540 1080 T1080 1080V1440H0z" fill="#c9f4df"/><circle cx="870" cy="290" r="100" fill="#ffe66d"/>`
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
    coverImages: ["边框", "插图", "涂写", "备忘", "提问", "柔和", "几何", "科技", "清新"].map((name, variant) => ({ name, url: createCover(title, mechanism, variant) })),
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
