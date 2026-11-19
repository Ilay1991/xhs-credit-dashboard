const fs = require('fs');
const path = require('path');

const outDir = __dirname;

// 度小满官方 app icon，base64 内嵌（不要手绘 logo）
const LOGO_URI =
  'data:image/png;base64,' +
  fs.readFileSync(path.join(outDir, 'logo.png')).toString('base64');

// 非低价三行版风险提示语 —— 不含 4.9% 首借
const legal = [
  '年化利率（单利）7.2%-24%，贷款额度、放款时间、还款方式、还款期限等以实际审批结果为准',
  '贷款有风险，借款需谨慎，请根据个人能力合理贷款，理性消费，避免逾期',
  '服务来源于重庆度小满小额贷款有限公司及合作金融机构，服务网址 https://www.duxiaoman.com',
];

const HL = '#FFE94D';

// [文件名, 第1行, 高亮行, 第3行, 背景色, 字色, 模板]
const notes = [
  ['n1', '缺5万',    '不开口', '也有路',   '#FAF3DA', '#3B3222', '手写'],
  ['n2', '急需10万', '哪个平台', '稳得住', '#FEFAE8', '#2B2720', '提问'],
  ['n3', '度小满',   '靠谱吗', '我查了',   '#F1F6EC', '#22331F', '清新'],
  ['n4', '手头紧',   '不找人', '找度小满', '#FFF0F0', '#3A1A1A', '柔和'],
  ['n5', '进货差8万', '不停工', '有办法',  '#1D2026', '#F2F3F5', '科技'],
];

// 模板排版配置：抖音美好体缺失时按 PingFang / Songti 降级，字号相应配平
function styleCfg(style) {
  switch (style) {
    case '手写':
      return { font: 'Songti SC, serif', size: 168, weight: 600, hl: 'marker' };
    case '清新':
      return { font: 'PingFang SC, sans-serif', size: 176, weight: 700, hl: 'band' };
    case '科技':
      // 深底上不能用 band：高亮块只压下半部分，上半截字会黑底黑字消失
      return { font: 'PingFang SC, sans-serif', size: 160, weight: 600, hl: 'block' };
    default:
      return { font: 'PingFang SC, sans-serif', size: 196, weight: 900, hl: 'block' };
  }
}

function logo() {
  return `<defs>
    <clipPath id="logoClip"><rect width="120" height="120" rx="28"/></clipPath>
  </defs>
  <g transform="translate(56 52)">
    <image href="${LOGO_URI}" width="120" height="120" clip-path="url(#logoClip)"/>
  </g>`;
}

function decor(style, ink) {
  switch (style) {
    case '提问': // 大号半透明问号 + 右下思考 emoji
      return `<text x="830" y="860" text-anchor="middle" fill="${ink}" opacity=".075"
        font-family="PingFang SC, sans-serif" font-size="640" font-weight="900">?</text>
      <text x="840" y="1130" font-size="160">🤔</text>`;

    case '清新': { // 米绿底 + 细叶线条
      return `<g opacity=".16" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round">
        <path d="M900 150 C900 260 860 330 800 380"/>
        <path d="M900 190 C860 190 830 215 812 250"/>
        <path d="M900 250 C864 254 840 280 826 312"/>
        <path d="M898 310 C870 318 852 340 842 364"/>
      </g>
      <g opacity=".10" stroke="${ink}" stroke-width="3">
        <line x1="64" y1="1180" x2="1016" y2="1180"/>
      </g>`;
    }

    case '柔和': // 简约弧线 + 细线条，不压 logo
      return `<g opacity=".13" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round">
        <path d="M40 1090 C240 1010 400 1120 560 1052"/>
      </g>
      <g opacity=".14" stroke="${ink}" stroke-width="4" stroke-linecap="round">
        <line x1="700" y1="1120" x2="1016" y2="1120"/>
        <line x1="800" y1="1150" x2="1016" y2="1150"/>
      </g>
      <circle cx="930" cy="250" r="78" fill="${ink}" opacity=".07"/>`;

    case '手写': { // 纸质横格 + 手写日期 + 右下 emoji
      const rules = [];
      for (let y = 300; y <= 1180; y += 62) {
        rules.push(`<line x1="56" y1="${y}" x2="1024" y2="${y}"/>`);
      }
      return `<g opacity=".07" stroke="${ink}" stroke-width="2">
        ${rules.join('\n        ')}
      </g>
      <g opacity=".5" fill="${ink}" font-family="Songti SC, serif">
        <text x="220" y="140" font-size="34" font-style="italic">Note</text>
        <line x1="222" y1="152" x2="340" y2="152" stroke="${ink}" stroke-width="2" opacity=".6"/>
      </g>
      <text x="800" y="1150" font-size="150">🙇</text>`;
    }

    case '科技': { // 深底网格 + 角标
      const g = [];
      for (let x = 60; x <= 1020; x += 80) g.push(`<line x1="${x}" y1="0" x2="${x}" y2="1440"/>`);
      for (let y = 60; y <= 1200; y += 80) g.push(`<line x1="0" y1="${y}" x2="1080" y2="${y}"/>`);
      return `<g opacity=".06" stroke="${ink}" stroke-width="2">
        ${g.join('\n        ')}
      </g>
      <text x="1016" y="140" text-anchor="end" fill="${ink}" opacity=".45"
        font-family="PingFang SC, sans-serif" font-size="34" font-weight="600">+++</text>`;
    }

    default:
      return '';
  }
}

function hlWidth(text, size) {
  return text.length * (size * 1.01) + 56;
}

function highlight(kind, hlX, hlW, size, baseY) {
  const h = size * 1.15;
  switch (kind) {
    case 'marker': // 荧光笔涂划
      return `<rect x="${hlX}" y="${baseY - h * 0.78}" width="${hlW}" height="${h}" rx="6"
        fill="${HL}" opacity=".88" transform="rotate(-1.3 540 ${baseY - h * 0.3})"/>`;
    case 'band': // 荧光笔底带，只压下半部分
      return `<rect x="${hlX}" y="${baseY - h * 0.46}" width="${hlW}" height="${h * 0.56}" rx="4"
        fill="${HL}" opacity=".92"/>`;
    default: // 实心色块
      return `<rect x="${hlX}" y="${baseY - h * 0.81}" width="${hlW}" height="${h}" rx="20" fill="${HL}"/>`;
  }
}

notes.forEach(([name, l1, hl, l3, bg, ink, style]) => {
  const cfg = styleCfg(style);
  const { font, size, weight } = cfg;

  // 高亮块压住文字时，字色在深底上要反相，保证可读
  const hlInk = style === '科技' ? '#1D2026' : ink;

  const legalText = legal
    .map(
      (line, j) =>
        `<text x="540" y="${1272 + j * 34}" text-anchor="middle"
        fill="${ink}" opacity=".42" font-family="PingFang SC, sans-serif" font-size="22">${line}</text>`
    )
    .join('\n  ');

  const hlW = hlWidth(hl, size);
  const hlX = 540 - hlW / 2;

  const gap = size * 1.32; // 行间距 ≥1.3 倍字号
  const midY = 700;
  const [y1, y2, y3] = [midY - gap, midY, midY + gap];

  const tilt =
    style === '手写'
      ? [`rotate(-0.9 540 ${y1})`, `rotate(0.7 540 ${y2})`, `rotate(-0.5 540 ${y3})`]
      : ['', '', ''];
  const tf = (t) => (t ? ` transform="${t}"` : '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
  <rect width="1080" height="1440" fill="${bg}"/>
  ${decor(style, ink)}
  ${logo()}
  <text x="540" y="${y1}" text-anchor="middle"${tf(tilt[0])}
    fill="${ink}" font-family="${font}" font-size="${size}" font-weight="${weight}">${l1}</text>
  ${highlight(cfg.hl, hlX, hlW, size, y2)}
  <text x="540" y="${y2}" text-anchor="middle"${tf(tilt[1])}
    fill="${hlInk}" font-family="${font}" font-size="${size}" font-weight="${weight}">${hl}</text>
  <text x="540" y="${y3}" text-anchor="middle"${tf(tilt[2])}
    fill="${ink}" font-family="${font}" font-size="${size}" font-weight="${weight}">${l3}</text>
  ${legalText}
</svg>`;

  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
  console.log(`${name}.svg [${style}] 高亮「${hl}」${hl.length}字 size=${size} 行距=${(gap / size).toFixed(2)}倍`);
});
