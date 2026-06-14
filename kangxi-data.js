// 康熙字典五格剖象法 — 眀燧科技 Siriis Labs

// ── 81 數吉凶表 ─────────────────────────────────────────
const SHUSHU_81 = {
  1:{level:'吉',desc:'太極之數，萬物開泰，生發無窮'},
  2:{level:'凶',desc:'分離之象，根基不固'},
  3:{level:'吉',desc:'進取如意，名利雙收'},
  4:{level:'凶',desc:'凶變浮沉，多受其累'},
  5:{level:'吉',desc:'福祿長壽，圓滿吉祥'},
  6:{level:'吉',desc:'安穩餘慶，吉人天相'},
  7:{level:'吉',desc:'剛毅果斷，權威旺盛'},
  8:{level:'吉',desc:'努力發展，意志剛健'},
  9:{level:'凶',desc:'興盡凋零，外祥內苦'},
  10:{level:'凶',desc:'萬物歸終，進退維谷'},
  11:{level:'吉',desc:'旱苗逢雨，枯木逢春'},
  12:{level:'凶',desc:'薄弱無力，孤掌難鳴'},
  13:{level:'吉',desc:'智能優秀，可成大業'},
  14:{level:'凶',desc:'淪落天涯，失意煩悶'},
  15:{level:'吉',desc:'福壽圓滿，富貴榮譽'},
  16:{level:'吉',desc:'貴人得助，財官雙美'},
  17:{level:'吉',desc:'突破萬難，吉星照耀'},
  18:{level:'吉',desc:'有志竟成，內外有運'},
  19:{level:'凶',desc:'多難多災，事不如意'},
  20:{level:'凶',desc:'凡事難成，徒勞無功'},
  21:{level:'吉',desc:'明月光照，獨立權威'},
  22:{level:'凶',desc:'秋草逢霜，懷才不遇'},
  23:{level:'吉',desc:'旭日東升，權勢顯達'},
  24:{level:'吉',desc:'錦繡前程，金錢豐盈'},
  25:{level:'吉',desc:'資性英敏，才能奇特'},
  26:{level:'凶',desc:'波瀾重疊，凶變屢至'},
  27:{level:'凶',desc:'一成一敗，一興一衰'},
  28:{level:'凶',desc:'魚臨旱地，難逃惡運'},
  29:{level:'吉',desc:'智謀兼備，財力歸集'},
  30:{level:'凶',desc:'一成一敗，浮沉不定'},
  31:{level:'吉',desc:'智勇得志，統帥眾人'},
  32:{level:'吉',desc:'池中之龍，風雲際會'},
  33:{level:'吉',desc:'家門隆昌，才德開展'},
  34:{level:'凶',desc:'災難重重，難以挽救'},
  35:{level:'吉',desc:'中吉之數，溫和平靜'},
  36:{level:'凶',desc:'波瀾起伏，多難浮沉'},
  37:{level:'吉',desc:'權威顯達，吉人天相'},
  38:{level:'吉',desc:'名雖可得，利則難獲'},
  39:{level:'吉',desc:'富貴榮華，財帛豐盈'},
  40:{level:'凶',desc:'一盛一衰，浮沉不定'},
  41:{level:'吉',desc:'德高望重，名利雙收'},
  42:{level:'凶',desc:'苦難折磨，事不如意'},
  43:{level:'凶',desc:'雨夜之花，外祥內苦'},
  44:{level:'凶',desc:'雨夜之鳥，慘淡苦痛'},
  45:{level:'吉',desc:'順風揚帆，萬事順利'},
  46:{level:'凶',desc:'浪裡行舟，謀事難成'},
  47:{level:'吉',desc:'開花結果，圓滿成功'},
  48:{level:'吉',desc:'美花豐實，鶴立雞群'},
  49:{level:'凶',desc:'吉凶難分，得失參半'},
  50:{level:'凶',desc:'吉凶互見，一成一衰'},
  51:{level:'凶',desc:'一盛一衰，浮沉不定'},
  52:{level:'吉',desc:'草木逢春，雨過天晴'},
  53:{level:'凶',desc:'盛衰參半，外祥內苦'},
  54:{level:'凶',desc:'難得幸福，災難重重'},
  55:{level:'凶',desc:'外觀隆昌，內隱禍患'},
  56:{level:'凶',desc:'事與願違，徒勞無功'},
  57:{level:'吉',desc:'寒雲蔽日，須忍待春'},
  58:{level:'吉',desc:'半凶半吉，先苦後甜'},
  59:{level:'凶',desc:'思慮不實，難酬大志'},
  60:{level:'凶',desc:'黑暗無光，心迷意亂'},
  61:{level:'吉',desc:'雲開月明，且喜得財'},
  62:{level:'凶',desc:'煩悶懊惱，事多不如意'},
  63:{level:'吉',desc:'萬物化育，繁榮之象'},
  64:{level:'凶',desc:'見異思遷，朝梁暮晉'},
  65:{level:'吉',desc:'巨流歸海，吉祥安泰'},
  66:{level:'凶',desc:'黑暗終生，進退兩難'},
  67:{level:'吉',desc:'順風順水，事事如意'},
  68:{level:'吉',desc:'思慮周詳，謀略奇佳'},
  69:{level:'凶',desc:'動搖不安，常陷逆境'},
  70:{level:'凶',desc:'慘淡經營，難免貧困'},
  71:{level:'吉',desc:'吉中帶凶，難望成功'},
  72:{level:'凶',desc:'利害混集，凶多吉少'},
  73:{level:'吉',desc:'安樂自在，幸福無憂'},
  74:{level:'凶',desc:'利不及費，殊途同歸'},
  75:{level:'吉',desc:'吉中帶凶，須忍始安'},
  76:{level:'凶',desc:'此數不吉，破產之象'},
  77:{level:'吉',desc:'先苦後甜，自然吉祥'},
  78:{level:'凶',desc:'內強外弱，初吉後凶'},
  79:{level:'凶',desc:'如走夜路，前途無光'},
  80:{level:'凶',desc:'凡事得失，難得平安'},
  81:{level:'吉',desc:'萬物回歸，最高之數'}
};

// 總格數字尾數對應五行
function getWuxingByNumber(num) {
  const last = num % 10;
  if (last===1||last===2) return '木';
  if (last===3||last===4) return '火';
  if (last===5||last===6) return '土';
  if (last===7||last===8) return '金';
  return '水'; // 9 或 0
}

// 查 81 數（超出81則循環取餘，0視為81）
function lookupShu(n) {
  if (n <= 0) return {level:'凶', desc:'數字異常'};
  const key = n > 81 ? (n % 81 || 81) : n;
  return SHUSHU_81[key] || {level:'凶', desc:'—'};
}

// ── 五格計算公式 ──────────────────────────────────────────
// surnameStrokes: number[]  e.g. [16] 或 [7,10]
// givenNameStrokes: number[]  e.g. [8] 或 [3,11]
function calculateFiveGrids(surnameStrokes, givenNameStrokes) {
  const sArr = surnameStrokes;
  const gArr = givenNameStrokes;
  let tian, ren, di, wai, zong;

  if (sArr.length === 1 && gArr.length === 1) {
    tian = sArr[0] + 1;
    ren  = sArr[0] + gArr[0];
    di   = gArr[0] + 1;
    wai  = 2;
  } else if (sArr.length === 1 && gArr.length === 2) {
    tian = sArr[0] + 1;
    ren  = sArr[0] + gArr[0];
    di   = gArr[0] + gArr[1];
    wai  = gArr[1] + 1;
  } else if (sArr.length === 2 && gArr.length === 1) {
    tian = sArr[0] + sArr[1];
    ren  = sArr[1] + gArr[0];
    di   = gArr[0] + 1;
    wai  = sArr[0] + 1;
  } else {
    // 複姓雙名
    tian = sArr[0] + sArr[1];
    ren  = sArr[1] + gArr[0];
    di   = gArr[0] + gArr[1];
    wai  = sArr[0] + gArr[1];
  }
  zong = [...sArr, ...gArr].reduce((a, b) => a + b, 0);

  return { 天格: tian, 人格: ren, 地格: di, 外格: wai, 總格: zong };
}

// ── 康熙筆劃資料庫 ────────────────────────────────────────
// 注意：以康熙字典正體筆劃為準（部首還原計算）
const KANGXI_STROKES = {
  // 常見香港姓氏
  '陳':16,'林':8,'黃':12,'李':7,'張':11,'王':4,'吳':7,'劉':15,'楊':13,'周':8,
  '許':11,'鄭':19,'馮':12,'蔡':17,'蘇':22,'葉':15,'何':7,'朱':6,'邱':12,'高':10,
  '梁':11,'羅':20,'賴':16,'徐':10,'莫':13,'鄧':19,'蕭':18,'鍾':17,'江':7,'唐':10,
  '洪':9,'杜':7,'韓':18,'龔':22,'阮':7,'簡':18,'程':12,'曾':12,'任':6,'沈':8,
  '姚':9,'彭':12,'呂':7,'蔣':18,'田':5,'范':9,'石':5,'董':13,'章':11,'馬':10,
  '方':4,'鄒':17,'萬':15,'趙':14,'孫':10,'胡':11,'譚':19,'顏':18,'潘':16,'袁':10,
  '盧':16,'戴':18,'邵':8,'龍':16,'史':5,'賀':12,'顧':21,'侯':9,
  // 常見命名字
  '明':8,'偉':11,'文':4,'志':7,'嘉':14,'俊':9,'浩':11,'健':11,'強':12,
  '傑':12,'信':9,'仁':4,'義':13,'智':12,'禮':18,'安':6,'樂':15,'康':11,'寧':14,
  '詩':13,'嵐':12,'怡':9,'雅':12,'婷':12,'欣':8,'妍':7,'思':9,'穎':16,'玥':9,
  '晴':12,'心':4,'美':9,'麗':19,'芳':10,'莉':10,'婉':11,'琳':13,'瑤':15,'蕊':18,
  '豪':14,'軒':10,'宇':6,'翔':12,'杰':8,'鋒':15,'慧':15,'蕙':18,'萱':15,'語':14,
  '彤':7,'晨':11,'旭':6,'昇':8,'煦':13,'燁':16,'諾':16,'霖':16,'澤':17,'駿':17,
  '峻':10,'博':12,'威':9,'恩':10,'廷':7,'瑋':14,'澄':15,'丹':4,'欣':8,'琪':13,
  '瑜':14,'璇':17,'珊':10,'珮':11,'珍':9,'珠':10,'琴':13,'瑞':13,'璐':19,'晶':12,'昭':9,
  '熙':16,'瑩':17,'詠':12,'芸':10,'菁':14,'蓮':17,'蘭':23,'薇':17,'茵':11,
  '家':10,'國':11,'建':9,'業':13,'城':10,'森':12,'輝':15,'勝':12,'富':12,'發':12,
  '榮':14,'盛':12,'偉':11,'賢':16,'達':13,'捷':12,'進':12,'昌':8,'旺':8,'興':16,
  '宏':7,'廣':15,'遠':14,'深':12,'正':5,'中':4,'大':3,'小':3,'天':4,'地':6,
  '山':3,'水':4,'木':4,'火':4,'金':8,'土':3,'日':4,'月':4,'星':9,'雲':12,
  '龍':16,'鳳':14,'鵬':19,'鶴':21,'燕':16,'鳥':11,'馬':10,'虎':8,'牛':4,'羊':6,
  '春':9,'夏':10,'秋':9,'冬':5,'年':6,'月':4,'日':4,'時':10,'代':5,
  '賢':16,'德':15,'業':13,'誠':14,'信':9,'忠':8,'義':13,'孝':7,
  '清':11,'靜':16,'柔':9,'慈':14,'善':12,'真':10,'純':10,'雅':12,
  '子':3,'之':4,'元':4,'本':5,'生':5,'長':8,'永':5,'久':3,'萬':15,
  // 希聲符系列（目+希=12, 禾+希=12, 日+希=11）
  '睎':12,'稀':12,'晞':11,
  // 今聲符系列（山+今=7, 艸+今=10）
  '岑':7,'芩':10
};

// 查筆劃（優先手動驗證表 > Unihan 完整庫 > 估算 fallback）
function getKangxiStrokes(ch) {
  // 1. 手動驗證（最高優先，已人工確認）
  if (KANGXI_STROKES[ch] !== undefined) return { strokes: KANGXI_STROKES[ch], estimated: false };
  // 2. Unihan 完整庫（kangxi-strokes-full.js 載入後可用）
  if (typeof KANGXI_STROKES_FULL !== 'undefined' && KANGXI_STROKES_FULL[ch] !== undefined) {
    return { strokes: KANGXI_STROKES_FULL[ch], estimated: false };
  }
  // 3. Fallback 估算（準確度低，記錄以便追蹤）
  const code = ch.charCodeAt(0);
  const est = 5 + (code % 16);
  console.warn(`[康熙筆劃] 未收錄字：「${ch}」(U+${code.toString(16).toUpperCase().padStart(4,'0')})，使用估算值 ${est} 劃`);
  return { strokes: est, estimated: true };
}

// 解析全名 → 姓氏筆劃陣列 + 名字筆劃陣列（支援複姓）
// 慣例：第一字/前兩字為姓，其餘為名；複姓需用戶指定，此處預設單姓
function parseNameStrokes(fullName, surnameLen) {
  const chars = [...fullName.trim()];
  if (chars.length < 2) return null;
  const sl = surnameLen || 1; // 姓氏字數，預設1
  const surnameChars = chars.slice(0, sl);
  const givenChars   = chars.slice(sl);
  if (givenChars.length === 0) return null;

  let hasEstimated = false;
  const surnameStrokes = surnameChars.map(c => {
    const r = getKangxiStrokes(c);
    if (r.estimated) hasEstimated = true;
    return r.strokes;
  });
  const givenNameStrokes = givenChars.map(c => {
    const r = getKangxiStrokes(c);
    if (r.estimated) hasEstimated = true;
    return r.strokes;
  });
  return { surnameStrokes, givenNameStrokes, surnameChars, givenChars, hasEstimated };
}
