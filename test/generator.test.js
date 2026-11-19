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
});
