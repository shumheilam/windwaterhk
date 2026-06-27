/**
 * gen-icons.js — 生成 App Icons
 * 背景：#fdf8f0（淡金米色）
 * 陽面：#8a6420（深金色）
 * 陰面：#2a1205（深褐色）
 * 512px 底部加 windwaterhk 文字
 */
const sharp = require('sharp');
const path = require('path');

function makeSVG(size, addDomain) {
  const s = size;
  const cx = s / 2;
  // Shift circle up slightly if we add domain text at bottom
  const cy = addDomain ? Math.round(s * 0.46) : s / 2;
  const r = Math.round(s * 0.36);
  const yinR = Math.round(r / 2);
  const rx = Math.round(s * 0.18);

  const top = cy - r;
  const bot = cy + r;
  const midTop = cy - yinR;
  const midBot = cy + yinR;

  // Classic yin-yang yang-half path (right side = gold #8a6420):
  // 1. Large CW arc: top → right → bottom
  // 2. Small CCW arc: bottom → center
  // 3. Small CW  arc: center → top
  const yangPath = [
    `M ${cx} ${top}`,
    `A ${r} ${r} 0 0 1 ${cx} ${bot}`,
    `A ${yinR} ${yinR} 0 0 0 ${cx} ${cy}`,
    `A ${yinR} ${yinR} 0 0 1 ${cx} ${top}`,
    'Z'
  ].join(' ');

  // Trigram symbols at 8 cardinal/intercardinal positions
  const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
  const tRadius = r + Math.round(s * 0.095);
  const fontSize = Math.round(s * 0.068);
  const trigramElems = trigrams.map((sym, i) => {
    const angle = (i * 45 - 90) * Math.PI / 180;
    const tx = Math.round(cx + Math.cos(angle) * tRadius);
    const ty = Math.round(cy + Math.sin(angle) * tRadius);
    return `<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="#8a6420" font-family="serif" opacity="0.85">${sym}</text>`;
  }).join('\n  ');

  const dotR   = Math.round(yinR * 0.33);
  const strokeW = Math.round(s * 0.016);
  const ringW   = Math.round(s * 0.02);
  const ringR   = r + Math.round(s * 0.048);

  // Domain text (512 only)
  const domainEl = addDomain
    ? `<text x="${cx}" y="${s * 0.93}" text-anchor="middle" dominant-baseline="middle" font-size="${Math.round(s * 0.052)}" fill="#8a6420" font-family="sans-serif" font-weight="500" letter-spacing="1" opacity="0.9">windwaterhk</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <!-- Background: light gold-cream -->
  <rect width="${s}" height="${s}" rx="${rx}" ry="${rx}" fill="#fdf8f0"/>

  <!-- Outer ring -->
  <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="#8a6420" stroke-width="${ringW}" opacity="0.55"/>

  <!-- Bagua trigrams -->
  ${trigramElems}

  <!-- Yin-Yang base: yin side = deep brown #2a1205 -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#2a1205"/>

  <!-- Yang half: deep gold #8a6420 -->
  <path d="${yangPath}" fill="#8a6420"/>

  <!-- Yin dot in yang area -->
  <circle cx="${cx}" cy="${midTop}" r="${dotR}" fill="#2a1205"/>

  <!-- Yang dot in yin area -->
  <circle cx="${cx}" cy="${midBot}" r="${dotR}" fill="#8a6420"/>

  <!-- Yin-yang border -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#8a6420" stroke-width="${strokeW}" opacity="0.8"/>

  ${domainEl}
</svg>`;
}

async function generate(size, filename, addDomain) {
  const svg = makeSVG(size, addDomain);
  const outPath = path.join(__dirname, filename);
  await sharp(Buffer.from(svg)).png().toFile(outPath);

  // Verify
  const { data, info } = await sharp(outPath).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  // Background corner (top-left area, inside rounded rect)
  const bgI = (Math.round(size * 0.05) * size + Math.round(size * 0.5)) * ch;
  const bgR = data[bgI], bgG = data[bgI + 1], bgB = data[bgI + 2];

  // Yin side (left-center)
  const leftI = (Math.round(size * 0.46) * size + Math.round(size * 0.28)) * ch;
  // Yang side (right-center)
  const rightI = (Math.round(size * 0.46) * size + Math.round(size * 0.72)) * ch;

  console.log(`\nGenerated ${filename} (${size}x${size})`);
  console.log(`  Background (top-center):  rgb(${bgR},${bgG},${bgB})  ← expect #fdf8f0 = (253,248,240)`);
  console.log(`  Yin side  (left-center):  rgb(${data[leftI]},${data[leftI+1]},${data[leftI+2]})  ← expect dark #2a1205`);
  console.log(`  Yang side (right-center): rgb(${data[rightI]},${data[rightI+1]},${data[rightI+2]}) ← expect gold #8a6420`);
}

(async () => {
  await generate(192, 'icon-bagua-192.png', false);
  await generate(512, 'icon-bagua-512.png', true);
  console.log('\nDone!');
})().catch(console.error);
