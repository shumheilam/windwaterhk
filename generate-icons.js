const sharp = require('sharp');
const path = require('path');

// 八卦 SVG icon：深色背景 + 八卦符號 + 金色邊框
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- 深色背景 -->
  <rect width="512" height="512" rx="80" fill="#0d0a1a"/>

  <!-- 外圓金色邊框 -->
  <circle cx="256" cy="256" r="230" fill="none" stroke="#c9a84c" stroke-width="6"/>

  <!-- 太極圓 -->
  <circle cx="256" cy="256" r="100" fill="none" stroke="#c9a84c" stroke-width="4"/>

  <!-- 太極：上半白 -->
  <path d="M256 156 A100 100 0 0 1 256 356 A50 50 0 0 1 256 256 A50 50 0 0 0 256 156 Z" fill="#c9a84c" opacity="0.85"/>
  <!-- 太極：下半黑 -->
  <path d="M256 156 A100 100 0 0 0 256 356 A50 50 0 0 0 256 256 A50 50 0 0 1 256 156 Z" fill="#1a1230"/>
  <!-- 太極小圓（上） -->
  <circle cx="256" cy="206" r="22" fill="#1a1230"/>
  <!-- 太極小圓（下） -->
  <circle cx="256" cy="306" r="22" fill="#c9a84c" opacity="0.85"/>

  <!-- 八卦線條（8個方向，每個3條橫線，代表八卦） -->
  <!-- 乾（北） 三條實線 -->
  <g transform="translate(256,256) rotate(0)">
    <line x1="-22" y1="-185" x2="22" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-173" x2="22" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-161" x2="22" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- 坤（南） 三條虛線 -->
  <g transform="translate(256,256) rotate(180)">
    <line x1="-10" y1="-185" x2="-2" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-185" x2="10" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-173" x2="-2" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-173" x2="10" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-161" x2="-2" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-161" x2="10" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- 震（東） -->
  <g transform="translate(256,256) rotate(90)">
    <line x1="-10" y1="-185" x2="-2" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-185" x2="10" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-173" x2="22" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-161" x2="22" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- 巽（西） -->
  <g transform="translate(256,256) rotate(270)">
    <line x1="-22" y1="-185" x2="22" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-173" x2="22" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-161" x2="-2" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-161" x2="10" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- 離（東南） -->
  <g transform="translate(256,256) rotate(45)">
    <line x1="-22" y1="-185" x2="22" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-173" x2="-2" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-173" x2="10" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-161" x2="22" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- 坎（西北） -->
  <g transform="translate(256,256) rotate(315)">
    <line x1="-10" y1="-185" x2="-2" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-185" x2="10" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-173" x2="22" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-161" x2="-2" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-161" x2="10" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- 艮（東北） -->
  <g transform="translate(256,256) rotate(135)">
    <line x1="-22" y1="-185" x2="22" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-173" x2="-2" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-173" x2="10" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-161" x2="-2" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-161" x2="10" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>
  <!-- 兌（西南） -->
  <g transform="translate(256,256) rotate(225)">
    <line x1="-22" y1="-185" x2="22" y2="-185" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-22" y1="-173" x2="22" y2="-173" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="-10" y1="-161" x2="-2" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
    <line x1="2" y1="-161" x2="10" y2="-161" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- App 名稱 -->
  <text x="256" y="460" text-anchor="middle" font-family="serif" font-size="38" fill="#c9a84c" letter-spacing="4">風生水起</text>
</svg>`;

async function generate() {
  const svgBuffer = Buffer.from(svgContent);

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(__dirname, 'icon-bagua-192.png'));
  console.log('✅ icon-bagua-192.png generated');

  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(__dirname, 'icon-bagua-512.png'));
  console.log('✅ icon-bagua-512.png generated');
}

generate().catch(err => { console.error(err); process.exit(1); });
