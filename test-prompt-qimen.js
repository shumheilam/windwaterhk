/**
 * 籤文深度解籤 Prompt 測試腳本
 * 模型：claude-haiku-4-5-20251001
 * 用途：評估5個測試案例的輸出質量，唔接入UI
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// ── System Prompt ─────────────────────────────────────
const SYSTEM_PROMPT = `你是「風生水起」App入面嘅AI解籤師，要模仿用戶選定嗰位神明嘅語氣同風格，針對用戶嘅籤文同所問問題，提供一段個人化、實用、溫暖嘅深度解讀。

規則：
1. 全程用粵語白話文（香港用戶），唔好用普通話用語
2. 必須貫徹指定神明嘅語氣風格（見下面風格指引），但唔好過度誇張或濫用口語化詞彙（例如土地公唔好成句都係「哎」）
3. 字數控制在120-180字之間，分2-3段，唔好太長
4. 必須緊扣用戶所問嘅問題類別（感情/事業/健康/財運），唔可以答非所問或泛泛而談
5. 必須體現籤文等級（大吉/吉/中吉/中/小凶/凶）對應嘅基調——吉籤要鼓勵行動，凶籤要溫和提醒謹慎，唔好凶籤都講到好似大吉咁，亦唔好大吉籤講到好似好驚咁
6. 結尾可以加一句簡短建議或行動方向，但唔好用「總之」「總括而言」呢類陳腔濫調開頭
7. 唔可以使用醫療、法律、財務專業建議嘅措辭（例如唔好講「應該買哪隻股票」），保持喺命理/心理層面嘅建議

【神明風格指引】
- 觀音菩薩：慈悲溫柔，多勸善積德，語氣柔和
- 關聖帝君：剛正威嚴，重義氣忠誠，語氣直接有力
- 月老：溫柔浪漫，專注姻緣，語氣溫馨
- 財神爺：務實直接，膽識進財，語氣爽快
- 王母娘娘：高貴莊嚴，慈旨護佑，語氣莊重
- 媽祖：慈母護航，風浪同行，語氣安慰
- 黃大仙：玄妙指引，天機示現，語氣神秘但唔可以講到完全唔知所謂
- 土地公：親切鄉土口語，老爺守護，語氣親切（適量用1-2個口語詞，唔好濫用）
- 城隍爺：公正嚴明，善惡有報，語氣嚴肅
- 文昌帝君：文雅博學，古典引經，語氣書卷氣
- 呂祖先師：道家超脫，萬物如夢，語氣哲學性
- 龍母：慈母龍威，水德庇佑，語氣溫厚有威嚴`;

// ── 5個測試案例 ─────────────────────────────────────
const TEST_CASES = [
  {
    id: 1,
    label: '觀音菩薩 × 第1籤大吉 × 感情',
    deity: '觀音菩薩',
    lot: 1,
    tier: '大吉',
    poem: ['龍騰四海昌', '鳳舞九天翔', '萬事皆如意', '福壽永無疆'],
    basicMeaning: '此乃百籤之首，大吉大利。所問之事天時地利人和俱備，前程光明，勇敢行動必有豐厚回報。',
    category: '感情',
  },
  {
    id: 2,
    label: '財神爺 × 第1籤大吉 × 財運',
    deity: '財神爺',
    lot: 1,
    tier: '大吉',
    poem: ['龍騰四海昌', '鳳舞九天翔', '萬事皆如意', '福壽永無疆'],
    basicMeaning: '此乃百籤之首，大吉大利。所問之事天時地利人和俱備，前程光明，勇敢行動必有豐厚回報。',
    category: '財運',
  },
  {
    id: 3,
    label: '土地公 × 第29籤中平 × 事業',
    deity: '土地公',
    lot: 29,
    tier: '中平',
    poem: ['雲淡風輕日', '四季自輪迴', '平常一顆心', '知足樂無涯'],
    basicMeaning: '平常心是智慧。所問之事結果平穩，既無大喜也無大憂。以知足常樂的心態面對，自得其樂。',
    category: '事業',
  },
  {
    id: 4,
    label: '城隍爺 × 第76籤凶 × 健康',
    deity: '城隍爺',
    lot: 76,
    tier: '凶',
    poem: ['獨木難成林', '孤掌難鳴聲', '此時需援手', '獨行恐遭難'],
    basicMeaning: '孤掌難鳴，此時您需要他人的支持與協助。所問之事切勿單打獨鬥，主動尋求援助，否則恐遭重挫。',
    category: '健康',
  },
  {
    id: 5,
    label: '月老 × 第52籤小凶 × 感情',
    deity: '月老',
    lot: 52,
    tier: '小凶',
    poem: ['風雨飄搖時', '前路多艱辛', '且收謹慎心', '靜候天晴日'],
    basicMeaning: '此時風雨飄搖，所問之事阻力較大。暫時收斂，謹慎行事，不宜輕舉妄動，靜候天晴自有轉機。',
    category: '感情',
  },
];

function buildUserMessage(tc) {
  return `神明：${tc.deity}
籤號：第${tc.lot}籤（${tc.tier}）
籤詩：${tc.poem.join('／')}
籤義：${tc.basicMeaning}
用戶所問：${tc.category}（感情/事業/健康/財運其中一項）

請以${tc.deity}嘅語氣，針對用戶所問嘅「${tc.category}」，提供深度解籤。`;
}

function countChars(text) {
  // 只計中文字符同常用標點，唔計空格換行
  return text.replace(/\s/g, '').length;
}

async function runTest(tc) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`【案例 ${tc.id}】${tc.label}`);
  console.log('─'.repeat(60));

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(tc) }],
  });

  const output = response.content[0].text;
  const charCount = countChars(output);

  console.log('【輸出】');
  console.log(output);
  console.log('─'.repeat(60));
  console.log(`【字數（去除空白）】${charCount} 字 ${charCount >= 120 && charCount <= 180 ? '✅ 合格' : charCount < 120 ? '❌ 太短' : '❌ 太長'}`);
  console.log(`【Input tokens】${response.usage.input_tokens}  【Output tokens】${response.usage.output_tokens}`);

  return { id: tc.id, label: tc.label, output, charCount };
}

async function main() {
  console.log('風生水起 · 籤文深度解籤 Prompt 測試');
  console.log(`模型：claude-haiku-4-5-20251001`);
  console.log(`測試案例：${TEST_CASES.length} 個`);

  const results = [];
  for (const tc of TEST_CASES) {
    const r = await runTest(tc);
    results.push(r);
  }

  // ── 評估摘要 ─────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log('【評估摘要】');
  console.log('─'.repeat(60));
  for (const r of results) {
    const charOk = r.charCount >= 120 && r.charCount <= 180 ? '✅' : '❌';
    console.log(`案例${r.id} ${r.label}`);
    console.log(`  字數：${r.charCount} ${charOk}`);
  }
  console.log('\n請人工檢查：');
  console.log('1. 案例3（土地公）有冇濫用「哎」或過度口語化？');
  console.log('2. 案例4（城隍爺凶籤）係咪溫和提醒而非誇大？');
  console.log('3. 每個案例係咪扣到對應嘅問題類別（感情/事業/健康/財運）？');
  console.log('4. 吉籤（案例1、2）有冇鼓勵行動？凶籤有冇假裝係好籤？');
}

main().catch(console.error);
