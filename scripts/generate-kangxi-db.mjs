// 生成康熙筆劃資料庫 — 眀燧科技 Siriis Labs
// 資料來源：Unicode Unihan Database (kTotalStrokes)
// 用法：node scripts/generate-kangxi-db.mjs

import https from 'https';
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── 1. 現有手動資料（作為 override，優先級最高）────────────────
// 從 kangxi-data.js 抽出的已驗證手動筆劃
const MANUAL_OVERRIDES = {
  '陳':16,'林':8,'黃':12,'李':7,'張':11,'王':4,'吳':7,'劉':15,'楊':13,'周':8,
  '許':11,'鄭':19,'馮':12,'蔡':17,'蘇':22,'葉':15,'何':7,'朱':6,'邱':12,'高':10,
  '梁':11,'羅':20,'賴':16,'徐':10,'莫':13,'鄧':19,'蕭':18,'鍾':17,'江':7,'唐':10,
  '洪':9,'杜':7,'韓':18,'龔':22,'阮':7,'簡':18,'程':12,'曾':12,'任':6,'沈':8,
  '姚':9,'彭':12,'呂':7,'蔣':18,'田':5,'范':9,'石':5,'董':13,'章':11,'馬':10,
  '方':4,'鄒':17,'萬':15,'趙':14,'孫':10,'胡':11,'譚':19,'顏':18,'潘':16,'袁':10,
  '盧':16,'戴':18,'邵':8,'龍':16,'史':5,'賀':12,'顧':21,'侯':9,
  '明':8,'偉':11,'文':4,'志':7,'嘉':14,'俊':9,'浩':11,'健':11,'強':12,
  '傑':12,'信':9,'仁':4,'義':13,'智':12,'禮':18,'安':6,'樂':15,'康':11,'寧':14,
  '詩':13,'嵐':12,'怡':9,'雅':12,'婷':12,'欣':8,'妍':7,'思':9,'穎':16,'玥':9,
  '晴':12,'心':4,'美':9,'麗':19,'芳':10,'莉':10,'婉':11,'琳':13,'瑤':15,'蕊':18,
  '豪':14,'軒':10,'宇':6,'翔':12,'杰':8,'鋒':15,'慧':15,'蕙':18,'萱':15,'語':14,
  '彤':7,'晨':11,'旭':6,'昇':8,'煦':13,'燁':16,'諾':16,'霖':16,'澤':17,'駿':17,
  '峻':10,'博':12,'威':9,'恩':10,'廷':7,'瑋':14,'澄':15,'丹':4,'琪':13,
  '瑜':14,'璇':17,'珊':10,'珮':11,'珍':9,'珠':10,'琴':13,'瑞':13,'璐':19,'晶':12,'昭':9,
  '熙':16,'瑩':17,'詠':12,'芸':10,'菁':14,'蓮':17,'蘭':23,'薇':17,'茵':11,
  '家':10,'國':11,'建':9,'業':13,'城':10,'森':12,'輝':15,'勝':12,'富':12,'發':12,
  '榮':14,'盛':12,'賢':16,'達':13,'捷':12,'進':12,'昌':8,'旺':8,'興':16,
  '宏':7,'廣':15,'遠':14,'深':12,'正':5,'中':4,'大':3,'小':3,'天':4,'地':6,
  '山':3,'水':4,'木':4,'火':4,'金':8,'土':3,'日':4,'月':4,'星':9,'雲':12,
  '鳳':14,'鵬':19,'鶴':21,'燕':16,'鳥':11,'虎':8,'牛':4,'羊':6,
  '春':9,'夏':10,'秋':9,'冬':5,'年':6,'時':10,'代':5,
  '德':15,'誠':14,'忠':8,'孝':7,
  '清':11,'靜':16,'柔':9,'慈':14,'善':12,'真':10,'純':10,
  '子':3,'之':4,'元':4,'本':5,'生':5,'長':8,'永':5,'久':3,
  '睎':12,'稀':12,'晞':11,
  '岑':7,'芩':10,
};

// ── 2. Big5 字集 Unicode 碼點範圍（常用繁體字）──────────────
// Big5 主要對應以下 Unicode 範圍（不完整，但覆蓋主體）
// 我們取 CJK 主範圍 U+4E00~U+9FFF，再加常用擴充
// 同時加入常見香港/台灣命名字集

// 實際做法：從 kTotalStrokes 中選出有 T（台灣）或 K（韓國）標注的
// 或者直接用 kTotalStrokes 的預設值（通常是傳統字形）

// ── 3. 下載 Unihan_NumericValues.txt ──────────────────────────
const UNIHAN_URL = 'https://unicode.org/Public/UCD/latest/ucd/Unihan.zip';
const CACHE_FILE = path.join(ROOT, 'scripts', 'cache', 'Unihan_IRGSources.txt');
const CACHE_DIR = path.join(ROOT, 'scripts', 'cache');

async function downloadText(url) {
  return new Promise((resolve, reject) => {
    const follow = (u) => {
      https.get(u, { headers: { 'User-Agent': 'FengShui-App/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${u}`));
          return;
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        res.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

async function downloadZip(url, destDir) {
  console.log('下載 Unihan.zip...');
  return new Promise((resolve, reject) => {
    const follow = (u) => {
      https.get(u, { headers: { 'User-Agent': 'FengShui-App/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        // Save zip to temp file then extract
        const tmpZip = path.join(destDir, 'Unihan.zip');
        const out = createWriteStream(tmpZip);
        res.pipe(out);
        out.on('finish', () => resolve(tmpZip));
        out.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

async function extractFromZip(zipPath, targetFile) {
  // Use unzipper or built-in approach
  // Node 24 doesn't have built-in zip, use child_process with PowerShell
  const { execSync } = await import('child_process');
  const destDir = path.dirname(zipPath);
  console.log('解壓 Unihan.zip...');
  execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, { stdio: 'inherit' });
  return path.join(destDir, targetFile);
}

// ── 4. 解析 kTotalStrokes ──────────────────────────────────────
function parseUnihanStrokes(content) {
  const result = {};
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;
    // Format: U+4E00	kTotalStrokes	1
    // Some entries have multiple values like "1 1" for different regions
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    if (parts[1] !== 'kTotalStrokes') continue;

    const codePoint = parseInt(parts[0].replace('U+', ''), 16);
    // Only CJK main range + Extension A (most Traditional Chinese chars)
    if (codePoint < 0x3400 || codePoint > 0x9FFF) continue;

    const char = String.fromCodePoint(codePoint);

    // kTotalStrokes can have multiple values "N N" for different sources
    // Format as of Unicode 15: single value, but may have T/K prefixes in older versions
    // Modern format: just a number or "N" (same for all regions)
    const valStr = parts[2].trim();

    // Try to parse - could be "N" or "N N" (first is T/traditional, second is S/simplified)
    const vals = valStr.split(' ').map(v => parseInt(v)).filter(v => !isNaN(v));
    if (vals.length === 0) continue;

    // Use first value (Traditional Chinese / default)
    result[char] = vals[0];
  }

  return result;
}

// ── 5. 過濾：只保留有意義的範圍 ───────────────────────────────
// Big5 字集大約在 U+4E00~U+9FFF 之間（CJK Unified Ideographs）
// 我們直接保留這個範圍，約13,000字但過濾掉罕用字
function filterCommonChars(strokeMap) {
  const filtered = {};
  let count = 0;

  for (const [char, strokes] of Object.entries(strokeMap)) {
    const cp = char.codePointAt(0);
    // Main CJK range (U+4E00-U+9FFF) - includes most common chars
    if (cp >= 0x4E00 && cp <= 0x9FFF) {
      filtered[char] = strokes;
      count++;
    }
    // Extension A (U+3400-U+4DBF) - skip, too rare for names
  }

  console.log(`過濾後保留 ${count} 個字（主 CJK 範圍）`);
  return filtered;
}

// ── 6. 合併：Unihan 為底，手動 override 優先 ──────────────────
function mergeData(unihanData, manualOverrides) {
  return { ...unihanData, ...manualOverrides };
}

// ── 7. 生成 JS 檔案 ───────────────────────────────────────────
function generateJS(mergedData, unihanCount, totalCount) {
  // Sort by codepoint for consistency
  const entries = Object.entries(mergedData).sort(
    ([a], [b]) => a.codePointAt(0) - b.codePointAt(0)
  );

  // Group into lines of 20 for readability
  const lines = [];
  for (let i = 0; i < entries.length; i += 20) {
    const chunk = entries.slice(i, i + 20);
    lines.push('  ' + chunk.map(([k, v]) => `'${k}':${v}`).join(','));
  }

  const content = `// 康熙字典筆劃完整資料庫 — 眀燧科技 Siriis Labs
// 自動生成：${new Date().toISOString().split('T')[0]}
// 資料來源：Unicode Unihan Database kTotalStrokes（${unihanCount} 字）
//           + 手動驗證 override（${Object.keys(MANUAL_OVERRIDES).length} 字）
// 總覆蓋：${totalCount} 字
// 使用方式：在 kangxi-data.js 之前載入此檔案

const KANGXI_STROKES_FULL = {
${lines.join(',\n')}
};
`;
  return content;
}

// ── 主流程 ─────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  let numericValuesPath = CACHE_FILE;

  if (!fs.existsSync(CACHE_FILE)) {
    try {
      const zipPath = await downloadZip(UNIHAN_URL, CACHE_DIR);
      numericValuesPath = await extractFromZip(zipPath, 'Unihan_IRGSources.txt');
      // Copy to cache location
      if (numericValuesPath !== CACHE_FILE) {
        fs.copyFileSync(numericValuesPath, CACHE_FILE);
      }
    } catch (err) {
      console.error('下載失敗，嘗試備用方式:', err.message);
      process.exit(1);
    }
  } else {
    console.log('使用快取 Unihan_NumericValues.txt');
  }

  console.log('解析 kTotalStrokes...');
  const content = fs.readFileSync(numericValuesPath, 'utf8');
  const unihanData = parseUnihanStrokes(content);
  const filteredData = filterCommonChars(unihanData);
  const unihanCount = Object.keys(filteredData).length;

  console.log(`Unihan 原始資料：${Object.keys(unihanData).length} 字`);
  console.log(`過濾後：${unihanCount} 字`);

  const merged = mergeData(filteredData, MANUAL_OVERRIDES);
  const totalCount = Object.keys(merged).length;
  console.log(`合併後（含手動 override）：${totalCount} 字`);

  const jsContent = generateJS(merged, unihanCount, totalCount);
  const outPath = path.join(ROOT, 'kangxi-strokes-full.js');
  fs.writeFileSync(outPath, jsContent, 'utf8');

  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`\n✅ 生成完成：kangxi-strokes-full.js`);
  console.log(`   檔案大小：${sizeKB} KB`);
  console.log(`   總覆蓋字數：${totalCount} 字`);
  console.log(`   手動 override：${Object.keys(MANUAL_OVERRIDES).length} 字（優先）`);

  // Verify a few known chars
  const testChars = ['王', '珮', '珊', '岑', '睎', '琳', '陳', '林'];
  console.log('\n驗證手動 override：');
  for (const ch of testChars) {
    const isOverride = ch in MANUAL_OVERRIDES;
    const strokes = merged[ch];
    console.log(`  ${ch}: ${strokes} 劃 ${isOverride ? '(手動✓)' : '(Unihan)'}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
