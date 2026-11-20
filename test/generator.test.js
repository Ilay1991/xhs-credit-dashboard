import test from "node:test";
import assert from "node:assert/strict";
import { generateRewrite } from "../lib/generator.js";

test("rewrite follows each source note instead of one fixed script", () => {
  const renovation = generateRewrite({ id: "a", keyword: "资金周转", title: "装修临时缺钱怎么办？", body: "家里装修预算突然不够" });
  const inventory = generateRewrite({ id: "b", keyword: "贷款", title: "店里补货资金怎么安排", body: "生意回款还没到账" });
  assert.notEqual(renovation.title, inventory.title);
  assert.notEqual(renovation.body, inventory.body);
  assert.match(renovation.title, /装修/);
  assert.match(inventory.title, /补货/);
  assert.ok(renovation.coverImages.every((cover) => cover.url.startsWith("data:image/svg+xml")));
  assert.notEqual(renovation.coverImages[0].url, inventory.coverImages[0].url);
  assert.equal(renovation.coverImages.length, 15);
  assert.equal(renovation.sourceTitle, "装修临时缺钱怎么办？");
  assert.match(renovation.adaptation.structure, /原爆款/);
  assert.ok(renovation.adaptation.skillRules.includes("非低价合规"));
  assert.equal(renovation.compliance.passed, true);
});

test("rewrite preserves the source scene anchor in title body and covers", () => {
  const result = generateRewrite({ id: "heater", keyword: "借呗", title: "热水器罢工换新，借钱应急周转慢慢还", body: "家里热水器突然坏了，等不了发工资" });
  assert.match(result.title, /热水器/);
  assert.match(result.body, /热水器/);
  assert.equal(result.adaptation.sourceAnchor, "热水器突然坏了要换新");
  assert.equal(result.coverImages.length, 15);
  assert.deepEqual(result.coverImages.map(cover => cover.name), [
    "急用钱换搭配", "急用钱提问", "插图", "美漫", "弥散",
    "几何", "清新", "书摘", "科技", "柔和",
    "备忘", "边框", "涂写", "手写", "便签"
  ]);
  assert.match(decodeURIComponent(result.coverImages[0].url), /data:image\/png;base64/);
  assert.match(decodeURIComponent(result.coverImages[0].url), /年化利率（单利）7\.2%-24%/);
});

test("competitor keywords are rewritten into a natural credit scene", () => {
  const result = generateRewrite({ id: "c", keyword: "借呗", title: "热水器坏了，借钱应急周转", body: "家电突然需要换新" });
  assert.doesNotMatch(result.title, /借呗时/);
  assert.equal(result.compliance.passed, true);
});
