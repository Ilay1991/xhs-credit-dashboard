const FORBIDDEN = [
  ["低息或低成本表述", /低[^。！？\n]*(息|费|利率|利息|成本)|(息|费|利率|利息|成本)[^。！？\n]*低/],
  ["到账时效承诺", /最快\s*\d+\s*分钟(?:到账|到款|放款)?|\d+\s*分钟(?:到账|到款|放款)|秒到|极速到账|马上放款|立刻到账|快速到账|到账快|放款快/],
  ["绝对授信承诺", /人人可享|都能借|零门槛|包过|黑户可做|无视征信/],
  ["非低价禁用卖点", /4\.9%|首借福利|新人活动|271\s*元/],
  ["学生人群", /在校大学生/]
];

export function countDisplayCharacters(value) {
  return [...value].reduce((total, character) => total + (/^[\x00-\xff]$/.test(character) ? 0.5 : 1), 0);
}

export function validateDraft(draft) {
  const combined = `${draft.title}\n${draft.coverText}\n${draft.body}`;
  const errors = [];
  if (countDisplayCharacters(draft.title) > 20) errors.push("标题超过20字");
  if (!/(度小满|急用钱|缺钱|借钱|急需|周转|手头紧|没钱|缺几万|资金周转)/.test([...draft.title].slice(0, 16).join(""))) {
    errors.push("标题前16字缺少搜索关键词");
  }
  if (countDisplayCharacters(draft.coverText) > 20) errors.push("首图文案超过20字");
  const bodyLength = [...draft.body.replace(/\s/g, "")].length;
  if (bodyLength < 170) errors.push("正文少于170字");
  if (bodyLength > 220) errors.push("正文超过220字");
  if (!/最高可达\s*20\s*万/.test(combined)) errors.push("缺少“最高可达20万”");
  if (!/最长(?:可分)?\s*24\s*期/.test(combined)) errors.push("缺少“最长24期”");
  if (/7\.2%/.test(combined) && !/7\.2%\s*起/.test(combined)) errors.push("7.2%必须带“起”");
  if (/20\s*[wW万]/.test(combined) && !/最高可达\s*20\s*[wW万]/.test(combined)) errors.push("20万必须带“最高可达”");
  if (/24\s*期/.test(combined) && !/最长(?:可分)?\s*24\s*期/.test(combined)) errors.push("24期必须带“最长”");
  for (const [label, pattern] of FORBIDDEN) if (pattern.test(combined)) errors.push(label);
  const requiredTags = ["#度小满", "#急用钱", "#缺钱"];
  for (const tag of requiredTags) if (!draft.tags.includes(tag)) errors.push(`缺少标签${tag}`);
  return { passed: errors.length === 0, errors };
}
