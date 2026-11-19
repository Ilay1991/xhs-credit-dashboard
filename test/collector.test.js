import test from "node:test";
import assert from "node:assert/strict";
import { matchesEditorialRules } from "../lib/collector.js";

test("competitor analysis keeps positive product content", () => {
  assert.equal(matchesEditorialRules({ title: "借呗怎么用？申请条件和分期体验" }, "借呗"), true);
  assert.equal(matchesEditorialRules({ title: "借呗逾期后被催收的真实经历" }, "借呗"), false);
});

test("Jingdong Jintiao excludes gold and wealth content", () => {
  assert.equal(matchesEditorialRules({ title: "京东金条申请额度体验分享" }, "京东金条"), true);
  assert.equal(matchesEditorialRules({ title: "黄金金条行情和理财投资攻略" }, "京东金条"), false);
  assert.equal(matchesEditorialRules({ title: "实物金条今天多少钱一克" }, "京东金条"), false);
});

test("search keywords favor borrowing needs and stories", () => {
  assert.equal(matchesEditorialRules({ title: "装修临时缺钱，我是怎么解决资金周转的" }, "借钱"), true);
  assert.equal(matchesEditorialRules({ title: "贷款逾期还不上，我该怎么办" }, "贷款"), false);
  assert.equal(matchesEditorialRules({ title: "银行业究竟如何运转" }, "贷款"), false);
  assert.equal(matchesEditorialRules({ title: "裁判文书：借了780万，合同约定月息三分" }, "资金周转"), false);
  assert.equal(matchesEditorialRules({ title: "弟弟网赌输光百万，我爸让我贷款帮他还债" }, "借钱"), false);
  assert.equal(matchesEditorialRules({ title: "终于不用拆东补西了，这是我的交易成功截图" }, "借钱"), false);
  assert.equal(matchesEditorialRules({ title: "哪里能借钱" }, "借钱"), false);
  assert.equal(matchesEditorialRules({ title: "出国留学的邪修凑钱办法" }, "贷款"), false);
  assert.equal(matchesEditorialRules({ title: "后悔提前结清房贷了，应急资金留少了" }, "资金周转"), false);
  assert.equal(matchesEditorialRules({ title: "京东金条电话诱导借款不要信" }, "京东金条"), false);
  assert.equal(matchesEditorialRules({ title: "京东金条首借免息，利率低" }, "京东金条"), false);
  assert.equal(matchesEditorialRules({ title: "佛山翡翠回收，资金周转更放心" }, "资金周转"), false);
});
