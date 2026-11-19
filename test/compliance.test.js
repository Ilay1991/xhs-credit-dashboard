import test from "node:test";
import assert from "node:assert/strict";
import { validateDraft } from "../lib/compliance.js";

const validDraft = {
  title: "急用钱不求人，周转先看额度💡",
  coverText: "急用钱，先把周转空间留出来",
  body: "真正让人焦虑的，是几件事偏偏挤在同一天。家里临时有支出，工资还没到账，又不想开口欠人情，反复盘算余额很消耗人。\n\n我先把缺口列出来，分清哪些必须处理、哪些可以往后排。再算每月能承受多少还款，避免只顾眼前，忽略之后的生活开销。\n\n确定需要周转后，我更关注额度和期限是否匹配。度小满最高可达20万，最长可分24期，线上可申请；额度不使用不收费，可以按实际需要判断。\n\n借款不是多一笔收入，也要给后面的还款留出空间。先做预算、再看产品，比一着急就决定更稳妥。",
  tags: ["#度小满", "#急用钱", "#缺钱"]
};

test("accepts a compliant non-price draft", () => {
  assert.deepEqual(validateDraft(validDraft), { passed: true, errors: [] });
});

test("rejects low-price and absolute promises", () => {
  const result = validateDraft({ ...validDraft, body: `${validDraft.body} 新人首借4.9%，黑户包过。` });
  assert.equal(result.passed, false);
  assert.ok(result.errors.includes("非低价禁用卖点"));
  assert.ok(result.errors.includes("绝对授信承诺"));
});
