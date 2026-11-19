const notes = [
  {
    id: 'n1',
    type: '人情成本',
    title: '急需5万别求人😩借钱我选度小满',
    cover: '缺5万 / 不开口 / 也有路',
    body: `翻遍通讯录，滑到一半又退出来，最后谁也没点。
差的那5万，开口一次就欠一次人情，这账算不清。
后来发现正规平台反而清爽，我用的度小满。
✅ 额度够：最高可达20万，应急不用东拼西凑
✅ 还得起：最长可分24期，每月压力摊得开
✅ 不用也不亏：额度不使用不收费，先申请备着
年化利率7.2%起，借1万元每天利息2元起，按日计息。
不想欠人情的，自己去看看能批多少。`,
    tags: '#度小满 #急用钱 #缺钱 #不求人 #资金周转 #借钱',
  },
  {
    id: 'n2',
    type: '场景痛点',
    title: '能一下周转10w的平台，我找到了🔥',
    cover: '急需10万 / 哪个平台 / 稳得住',
    body: `三天内必须交齐，对方只给到周五，电话一挂我就慌了。
差的10万不是小数目，分好几处凑只会越拖越乱。
最后选了度小满，图的就是一次性额度够。
· 最高可达20万额度，不用东一笔西一笔
· 最长可分24期，还款节奏自己挑
· 额度不使用不收费，先申请当备用金也行
正规大平台，信息全程加密，年化利率7.2%起，按日计息。
急的时候最怕来回折腾，一个地方解决完就行。`,
    tags: '#度小满 #急用钱 #缺钱 #资金周转 #应急 #借钱平台',
  },
  {
    id: 'n3',
    type: '疑虑解答',
    title: '日常急用钱，度小满借钱靠谱吗❓',
    cover: '度小满 / 靠谱吗 / 我查了',
    body: `身边有人说网上那些平台都是坑，我真的去查了一圈再决定。
借钱先看三件事：是不是持牌、息费写不写清楚、提前还要不要违约金。
度小满这三条我都对过了，服务来源于重庆度小满小额贷款有限公司及合作金融机构。
额度最高可达20万，最长可分24期，额度不使用不收费。
年化利率7.2%起，万元日息2元起，按日计息，明细能查。
自己心里有数再借，比听谁说一句靠谱强。`,
    tags: '#度小满 #急用钱 #缺钱 #借钱 #正规平台 #信贷科普',
  },
  {
    id: 'n4',
    type: '反常识挑战',
    title: '清醒女孩手头紧，都在用度小满😉',
    cover: '手头紧 / 不找人 / 找度小满',
    body: `以前以为张不开嘴是面子，后来才懂是怕关系变味。
真到手头紧、要拿几万块出来的时候，人情才是最贵的那笔账。
清醒的做法是找正规平台，我用的度小满。
· 最高可达20万额度，先申请备着，额度不使用不收费
· 最长可分24期，不逼自己一口气还完
· 国家田径队官方合作伙伴，平台稳，心里不打鼓
年化利率7.2%起，万元日息2元起，按日计息。
自己扛得住，才是真的清醒。`,
    tags: '#度小满 #急用钱 #缺钱 #手头紧 #独立女性 #不求人',
  },
  {
    id: 'n5',
    type: '场景痛点·小微',
    title: '进货差8万周转，度小满备一份💰',
    cover: '进货差8万 / 不停工 / 有办法',
    body: `旺季备货最怕卡在中间，货等着订，账期还没回来，两头都催。
差的那8万不是生意不好，是节奏对不上。
这种时候我不找人凑，用度小满。
· 最高可达20万周转金，进货、垫资、发工资都够用
· 最长可分24期分摊，月供压力小，不占着现金流
· 额度不使用不收费，先申请备着，真要用再提
线上申请，无需复杂纸质资料，专属企微1v1。
年化利率7.2%起，万元日息2元起，按日计息。`,
    tags: '#度小满 #急用钱 #缺钱 #资金周转 #小微企业主 #生意周转',
  },
];

// ─── 校验 ───────────────────────────────────────
const EMOJI = /\p{Extended_Pictographic}/gu;

function titleLen(s) {
  const e = (s.match(EMOJI) || []).length;
  const rest = s.replace(EMOJI, '');
  let n = 0;
  for (const ch of rest) n += /[\x00-\x7F]/.test(ch) ? 0.5 : 1;
  return { len: n + e, emoji: e };
}

const MONEY = /钱|借贷|额度|利率|支出|急用钱|万|周转/;
function moneyPos(body) {
  const first = body.split('\n')[0] + body.split('\n').slice(1).join('');
  const plain = body.replace(/\n/g, '');
  for (let i = 0; i < plain.length; i++) {
    if (MONEY.test(plain[i]) || MONEY.test(plain.substr(i, 2))) return i + 1;
  }
  return -1;
}

const RED = [
  [/低(?=[^。！？\n]*(息|费|利率|利息|成本))|(?:息|费|利率|利息|成本)[^。！？\n]*低/, '「低」与息费同句'],
  [/\d+\s*分钟|秒到|极速到账|马上放款|立刻到账/, '时效承诺'],
  [/4\.9|首借|新人活动|新人福利/, '低价卖点（非低价禁用）'],
  [/人人可享|都能参加|零门槛|包过|黑户|在校大学生/, '绝对化/违规承诺'],
];

function checkPrefix(body, kw, prefix) {
  const re = new RegExp(`.{0,6}${kw}`, 'g');
  return (body.match(re) || []).every((m) => m.includes(prefix));
}

let allPass = true;
notes.forEach((n) => {
  const t = titleLen(n.title);
  const plain = n.body.replace(/\n/g, '');
  const mp = moneyPos(n.body);
  const red = RED.filter(([re]) => re.test(n.body + n.title)).map(([, d]) => d);
  const pre = [];
  if (/20万|20w/.test(n.body) && !checkPrefix(n.body, '20万', '最高可达')) pre.push('20万缺「最高可达」');
  if (/24期/.test(n.body) && !checkPrefix(n.body, '24期', '最长')) pre.push('24期缺「最长」');
  if (/7\.2%/.test(n.body) && !/7\.2%起/.test(n.body)) pre.push('7.2%缺「起」');
  const tagN = n.tags.split('#').length - 1;
  const mustTags = ['#度小满', '#急用钱', '#缺钱'].filter((x) => !n.tags.includes(x));

  const fails = [];
  if (t.len > 20) fails.push(`标题${t.len}字超限`);
  if (t.emoji > 2) fails.push(`emoji ${t.emoji}个`);
  if (plain.length > 220) fails.push(`正文${plain.length}字超限`);
  if (mp < 20 || mp > 35) fails.push(`钱要素在第${mp}字（窗口20-35）`);
  if (tagN < 5 || tagN > 8) fails.push(`标签${tagN}个`);
  if (mustTags.length) fails.push(`缺必带标签 ${mustTags.join('')}`);
  fails.push(...red, ...pre);

  if (fails.length) allPass = false;
  console.log(
    `${n.id} ${n.type}\n  标题 ${t.len}字/emoji${t.emoji}  正文 ${plain.length}字  钱要素第${mp}字  标签${tagN}个\n  ${
      fails.length ? '✗ ' + fails.join(' | ') : '✓ 全部通过'
    }\n`
  );
});
console.log(allPass ? '== 5 篇全部通过 ==' : '== 有不合格项 ==');
