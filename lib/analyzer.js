const HOOK_PATTERNS = [
  ["反常识", /居然|竟然|还有人不知道|清醒|别再/],
  ["人情成本", /求人|朋友|父母|人情|开口/],
  ["场景痛点", /房租|周转|进货|工资|急用|手头紧|缺钱/],
  ["疑虑解答", /靠谱吗|条件|怎么办|怎么借|正规吗/]
];

export function analyzeNotes(notes) {
  const text = notes.map((note) => `${note.title} ${note.body}`).join(" ");
  const hooks = HOOK_PATTERNS.map(([name, pattern]) => ({
    name,
    count: notes.filter((note) => pattern.test(`${note.title} ${note.body}`)).length
  })).sort((left, right) => right.count - left.count);
  const keywords = ["急用钱", "借钱", "贷款", "周转", "额度", "期限", "靠谱"]
    .map((word) => ({ word, count: text.split(word).length - 1 }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);
  return {
    noteCount: notes.length,
    dominantHook: hooks[0]?.count ? hooks[0].name : "信息差",
    hooks,
    keywords,
    summary: notes.length
      ? `本轮 ${notes.length} 篇笔记以${hooks[0]?.name || "信息差"}切入最集中，建议保留搜索意图，但更换叙事场景和句式。`
      : "暂无可分析笔记。"
  };
}
