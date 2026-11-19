import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const API_ROOT = "https://api.tikhub.io";
const CREDIT_TERMS = ["借钱", "急用钱", "贷款", "缺钱", "资金周转", "手头紧", "借款", "网贷", "额度", "利率", "还款", "征信", "放款", "分期"];
const EXCLUDED_TERMS = ["明星", "娱乐圈", "八卦", "电视剧", "综艺", "演员", "爱豆", "追星", "粉丝", "恋情", "离婚", "出轨", "回应", "真相", "热搜", "转账单", "小说", "短剧", "剧情", "老人", "老鼠", "家产", "催婚", "怀孕", "结婚孩子", "女朋友", "小生意", "贴贴", "加仓", "两融", "裁判文书", "合同约定", "月息三分", "年利率36%", "借了780万"];
const FINANCE_SIGNALS = ["贷款", "借款", "网贷", "额度", "利率", "年化", "还款", "征信", "放款", "分期", "审批", "申请", "银行", "金融", "借呗", "白条", "金条", "资金周转", "救急借钱", "借钱平台", "借款平台"];
const ADVICE_SIGNALS = ["怎么办", "怎么借", "方法", "攻略", "避坑", "注意", "条件", "要求", "区别", "靠谱吗", "正规", "成本"];
const COMPETITOR_KEYWORDS = new Set(["借呗", "京东金条"]);
const NEGATIVE_CREDIT_SIGNALS = ["逾期", "还不上", "不还", "催收", "爆通讯录", "黑户", "征信黑", "套路贷", "被骗", "诈骗", "暴雷", "崩溃", "上岸", "拆东墙补西墙", "拆东补西", "以贷养贷", "欠债", "负债", "强制", "投诉", "起诉", "坐牢", "跑路", "赌博", "网赌", "赌债", "帮他还债", "替他还债", "替别人还债", "还清债务", "结清负债", "欠款", "诱导借款", "不要信", "坑人", "不靠谱", "放款失败"];
const NEED_STORY_SIGNALS = ["急用钱", "缺钱", "手头紧", "资金周转", "周转不开", "临时周转", "借钱", "借款", "备用金", "房租", "装修", "进货", "生意", "看病", "住院", "学费", "日常开销", "工资", "应急"];
const CONCRETE_NEED_SIGNALS = ["急用钱", "缺钱", "手头紧", "资金周转", "周转不开", "临时周转", "备用金", "房租", "装修", "进货", "生意", "看病", "住院", "学费", "日常开销", "工资", "应急"];
const LOW_REFERENCE_SIGNALS = ["交易成功", "操作结果", "到账截图", "放款截图", "授信截图", "短信截图", "聊天记录", "第一天开始上强度", "终于还完", "终于不用", "邪修", "后悔提前结清房贷", "后悔提前还房贷"];
const LOW_PRICE_SIGNALS = ["免息", "低息", "最低利率", "利率低", "低的利率", "利率还能降", "降利率", "超低利率", "优惠利率", "首借优惠", "新人福利"];
const UNRELATED_COMMERCE_SIGNALS = ["翡翠回收", "黄金寄存", "回收劳力士", "房东直售", "汽车出售", "黑武士凯雷德", "融资计划书", "公库融资"];
const POSITIVE_PRODUCT_SIGNALS = ["怎么用", "如何用", "申请", "条件", "额度", "利率", "分期", "提前还", "还款", "区别", "靠谱吗", "体验", "测评", "攻略", "教程", "周转", "应急", "备用"];
const GOLD_INVESTMENT_SIGNALS = ["黄金", "金价", "实物金", "积存金", "贵金属", "克金", "提金", "黄金基金", "理财", "投资", "行情", "回调"];
const QUERY_EXPANSIONS = {
  "借呗": ["借呗 申请", "借呗 额度", "借呗 使用体验"],
  "京东金条": ["京东金条 借钱", "京东金条 申请", "京东金条 额度"],
  "借钱": ["急用钱 借钱故事", "临时缺钱 怎么办", "借钱 应急周转"],
  "急用钱": ["急用钱 应急", "突然急用钱", "急用钱 周转故事"],
  "贷款": ["贷款 真实需求", "装修贷款 周转", "学费贷款 资金需求"],
  "资金周转": ["生意资金周转", "进货资金周转", "临时资金周转"]
};

function noteText(note) {
  return `${note.title || ""} ${note.desc || note.body || note.fullContent || ""}`;
}

export function matchesEditorialRules(note, keyword) {
  const text = noteText(note);
  if (EXCLUDED_TERMS.some((term) => text.includes(term))) return false;
  if (NEGATIVE_CREDIT_SIGNALS.some((term) => text.includes(term))) return false;
  if (LOW_REFERENCE_SIGNALS.some((term) => text.includes(term))) return false;
  if (LOW_PRICE_SIGNALS.some((term) => text.includes(term))) return false;
  if (UNRELATED_COMMERCE_SIGNALS.some((term) => text.includes(term))) return false;
  if (keyword === "京东金条") {
    if (!text.includes("京东金条")) return false;
    if (GOLD_INVESTMENT_SIGNALS.some((term) => text.includes(term))) return false;
  }
  if (COMPETITOR_KEYWORDS.has(keyword)) {
    return text.includes(keyword) && POSITIVE_PRODUCT_SIGNALS.some((term) => text.includes(term));
  }
  return CONCRETE_NEED_SIGNALS.some((term) => text.includes(term));
}

function editorialScore(note, keyword) {
  const text = noteText(note);
  let score = 0;
  if (text.includes(keyword)) score += 4;
  score += NEED_STORY_SIGNALS.filter((term) => text.includes(term)).length * 3;
  score += POSITIVE_PRODUCT_SIGNALS.filter((term) => text.includes(term)).length * 2;
  if (/我|家里|父母|朋友|生意|房租|装修|进货|住院|学费|突然|临时/.test(text)) score += 4;
  if (/怎么办|怎么借|需要什么|靠谱吗|亲测|体验|分享/.test(text)) score += 3;
  return score;
}

async function getApiKey() {
  if (process.env.TIKHUB_API_KEY) return process.env.TIKHUB_API_KEY;
  try {
    const { stdout } = await execFileAsync("security", ["find-generic-password", "-s", "xhs-credit-dashboard.tikhub", "-w"]);
    return stdout.trim();
  } catch {
    throw new Error("TikHub API 密钥未配置");
  }
}

async function tikhub(path, parameters) {
  const url = new URL(path, API_ROOT);
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, String(value));
  const response = await fetch(url, { headers: { Authorization: `Bearer ${await getApiKey()}` } });
  const payload = await response.json();
  if (!response.ok || payload.code !== 200) {
    const detail = payload.message_zh || payload.message || payload.detail;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail || payload));
  }
  return payload.data;
}

function relevant(note, keyword) {
  const text = `${note.title || ""} ${note.desc || ""}`;
  const financeHits = FINANCE_SIGNALS.filter((term) => text.includes(term)).length;
  const adviceIntent = text.includes(keyword) && ADVICE_SIGNALS.some((term) => text.includes(term));
  return note.type !== "video" && note.images_list?.length > 0 && !EXCLUDED_TERMS.some((term) => text.includes(term)) && (financeHits >= 1 || adviceIntent) && matchesEditorialRules(note, keyword);
}

function normalize(note, keyword) {
  const likes = Number(note.liked_count || note.nice_count || 0);
  const favorites = Number(note.collected_count || 0);
  const comments = Number(note.comments_count || 0);
  const engagement = likes + favorites * 1.4 + comments * 1.8;
  const publishedAt = note.timestamp ? new Date(note.timestamp * 1000).toISOString() : "";
  const url = `https://www.xiaohongshu.com/explore/${note.id}?xsec_token=${encodeURIComponent(note.xsec_token || "")}&xsec_source=pc_search`;
  return {
    id: note.id, keyword, title: note.title || note.desc?.slice(0, 24) || "小红书笔记",
    body: note.desc || "", fullContent: note.desc || "", author: note.user?.nickname || "小红书作者",
    authorId: note.user?.userid || "", publishedAt, url, type: note.type === "video" ? "视频" : "图文",
    likes, favorites, comments, shares: Number(note.shared_count || 0), engagement,
    cover: note.images_list?.[0]?.url_size_large || note.images_list?.[0]?.url || "", xsecToken: note.xsec_token || ""
  };
}

export async function collectTopNotes({ keywords }) {
  const groups = [];
  for (const keyword of keywords) {
    const items = [];
    const queries = [keyword, ...(QUERY_EXPANSIONS[keyword] || [])];
    const errors = [];
    for (const query of queries) {
      try {
        const result = await tikhub("/api/v1/xiaohongshu/app_v2/search_notes", {
          keyword: query, page: 1, sort_type: "popularity_descending", note_type: "普通笔记", time_filter: "一周内", source: "explore_feed", ai_mode: 0
        });
        items.push(...(result?.data?.items || []));
      } catch (error) {
        errors.push(`${query}: ${error.message}`);
      }
    }
    const seen = new Set();
    const notes = items.map((item) => item.note).filter(Boolean).filter((note) => relevant(note, keyword)).map((note) => ({ ...normalize(note, keyword), editorialScore: editorialScore(note, keyword) })).filter((note) => !seen.has(note.id) && seen.add(note.id)).sort((a, b) => b.editorialScore - a.editorialScore || b.engagement - a.engagement).slice(0, 5);
    groups.push({ keyword, notes, collectionErrors: errors });
  }
  return groups;
}

export async function collectNoteComments(noteId) {
  const result = await tikhub("/api/v1/xiaohongshu/app_v2/get_note_comments", { note_id: noteId, cursor: "", index: 0, pageArea: "UNFOLDED", sort_strategy: "like_count" });
  return (result?.data?.comments || []).map((comment) => ({
    id: comment.id, content: comment.content || "", likes: Number(comment.like_count || 0),
    author: comment.user?.nickname || "小红书用户", location: comment.ip_location || "", replies: Number(comment.sub_comment_count || 0)
  })).filter((comment) => comment.content);
}

export async function openLoginBrowser() {
  throw new Error("当前已切换为 TikHub API 采集，无需登录小红书");
}
