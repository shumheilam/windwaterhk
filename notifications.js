/* ── FengShui Oracle — Web Push Notification System ── */

// ── Debug Log ──
function fsoDebugLog(msg) {
  const panel = document.getElementById('fsoDebugPanel');
  const log   = document.getElementById('fsoDebugLog');
  if (panel && log) {
    panel.style.display = 'block';
    const line = document.createElement('div');
    line.textContent = new Date().toLocaleTimeString() + ' ' + msg;
    log.appendChild(line);
  }
  console.log('[FSO]', msg);
}

// ── Storage Keys ──
const FSO_NOTIF_SETTINGS_KEY  = 'fs_notif_settings';
const FSO_NOTIF_DEITY_KEY     = 'fs_notif_deity_sent';
const FSO_NOTIF_BDAY_KEY      = 'fs_notif_bday_sent';
const FSO_NOTIF_DAILY_KEY     = 'fs_notif_daily_sent';

// ── Lunar Calendar (mirrors calendar.html logic) ──
const FSO_LMD = 29.53059; // average lunar month days
const FSO_LNY = [
  { solar: new Date(2020, 0, 25), lYear: 2020 },
  { solar: new Date(2021, 1, 12), lYear: 2021 },
  { solar: new Date(2022, 1,  1), lYear: 2022 },
  { solar: new Date(2023, 0, 22), lYear: 2023 },
  { solar: new Date(2024, 1, 10), lYear: 2024 },
  { solar: new Date(2025, 0, 29), lYear: 2025 },
  { solar: new Date(2026, 1, 17), lYear: 2026 },
  { solar: new Date(2027, 1,  6), lYear: 2027 },
  { solar: new Date(2028, 0, 26), lYear: 2028 },
  { solar: new Date(2029, 1, 13), lYear: 2029 },
  { solar: new Date(2030, 1,  3), lYear: 2030 },
];

function fsoSolarToLunar(date) {
  let lny = FSO_LNY[0];
  for (let i = 0; i < FSO_LNY.length; i++) {
    if (date >= FSO_LNY[i].solar) lny = FSO_LNY[i];
    else break;
  }
  const days = Math.round((date - lny.solar) / 86400000);
  const mElapsed = Math.floor(days / FSO_LMD);
  const dayInMonth = days - Math.round(mElapsed * FSO_LMD) + 1;
  return {
    month: (mElapsed % 12) + 1,
    day: Math.max(1, Math.min(30, dayInMonth)),
  };
}

// ── Deity Birthday Definitions ──
const FSO_DEITY_BDAYS = [
  { name: '觀音菩薩', icon: '🪷', month: 2,  day: 19 },
  { name: '觀音菩薩', icon: '🪷', month: 6,  day: 19 },
  { name: '觀音菩薩', icon: '🪷', month: 9,  day: 19 },
  { name: '關聖帝君', icon: '⚔️', month: 6,  day: 24 },
  { name: '月老',     icon: '🔴', month: 8,  day: 15 },
  { name: '財神爺',   icon: '🏮', month: 3,  day: 15 },
  { name: '王母娘娘', icon: '👸', month: 7,  day: 18 },
  { name: '媽祖',     icon: '🌊', month: 3,  day: 23 },
  { name: '黃大仙',   icon: '🦊', month: 8,  day: 23 },
  { name: '土地公',   icon: '🏡', month: 2,  day: 2  },
  { name: '土地公',   icon: '🏡', month: 8,  day: 15 },
  { name: '城隍爺',   icon: '⚖️', month: 5,  day: 11 },
  { name: '文昌帝君', icon: '📚', month: 2,  day: 3  },
  { name: '呂祖先師', icon: '☯️', month: 4,  day: 14 },
  { name: '龍母',     icon: '🐉', month: 5,  day: 8  },
];

// ── Settings Helpers ──
function fsoGetNotifSettings() {
  try { return JSON.parse(localStorage.getItem(FSO_NOTIF_SETTINGS_KEY) || '{}'); } catch { return {}; }
}
function fsoSaveNotifSettings(s) {
  localStorage.setItem(FSO_NOTIF_SETTINGS_KEY, JSON.stringify(s));
}

// ── Date Key for dedup ──
function fsoDayKey(date) {
  date = date || new Date();
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// ── Service Worker Registration ──
function fsoRegisterSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(function() {});
}

// ── Send notification via SW or Notification API ──
function fsoShowNotif(title, body, url, tag) {
  alert('fsoShowNotif: ' + title + '\npermission: ' + Notification.permission + '\nSW controller: ' + !!(navigator.serviceWorker && navigator.serviceWorker.controller));

  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    alert('BLOCKED: permission not granted');
    return;
  }

  const opts = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: tag || ('fso-' + Date.now()),
    data: { url: url || '/' },
    vibrate: [200, 100, 200],
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    alert('Branch 1: postMessage to SW');
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION', title: title, body: body, url: url || '/', tag: opts.tag
    });
  } else if ('serviceWorker' in navigator) {
    alert('Branch 2: SW ready then showNotification');
    navigator.serviceWorker.ready.then(function(reg) {
      alert('Branch 2a: reg.showNotification');
      reg.showNotification(title, opts);
    }).catch(function() {
      alert('Branch 2b: fallback new Notification');
      new Notification(title, opts);
    });
  } else {
    alert('Branch 3: new Notification direct');
    new Notification(title, opts);
  }
}

// ── Deity Birthday Reminders ──
function fsoCheckDeityBirthdays() {
  const s = fsoGetNotifSettings();
  if (s.deityBirthdays === false) return;

  const sent = JSON.parse(localStorage.getItem(FSO_NOTIF_DEITY_KEY) || '{}');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowLunar = fsoSolarToLunar(tomorrow);
  const todayKey = fsoDayKey();

  FSO_DEITY_BDAYS.forEach(function(db) {
    if (db.month === tomorrowLunar.month && db.day === tomorrowLunar.day) {
      const id = 'deity-' + db.name + '-' + db.month + '-' + db.day + '-' + todayKey;
      if (!sent[id]) {
        fsoShowNotif(
          '明日係' + db.name + '聖誕 ' + db.icon,
          '明日係' + db.name + '聖誕，記得拜神🙏',
          '/calendar.html',
          'deity-' + db.month + '-' + db.day
        );
        sent[id] = true;
        localStorage.setItem(FSO_NOTIF_DEITY_KEY, JSON.stringify(sent));
      }
    }
  });
}

// ── User Birthday Greeting ──
function fsoCheckUserBirthday() {
  const s = fsoGetNotifSettings();
  if (s.userBirthday === false) return;

  const profiles = JSON.parse(localStorage.getItem('fengshui_profiles_v1') || '[]');
  if (!profiles.length) return;

  const today = new Date();
  const todayKey = fsoDayKey();
  const sent = JSON.parse(localStorage.getItem(FSO_NOTIF_BDAY_KEY) || '{}');

  profiles.forEach(function(p) {
    if (!p.month || !p.day) return;
    if (today.getMonth() + 1 === parseInt(p.month) && today.getDate() === parseInt(p.day)) {
      const id = 'bday-' + (p.name || 'user') + '-' + todayKey;
      if (!sent[id]) {
        const name = p.name || '您';
        fsoShowNotif(
          '🎂 生日快樂！',
          '生日快樂！願' + name + '今年行大運，諸事順遂！',
          '/',
          'bday-today'
        );
        sent[id] = true;
        localStorage.setItem(FSO_NOTIF_BDAY_KEY, JSON.stringify(sent));
      }
    }
  });
}

// ── Daily Horoscope Content Helpers ──────────────────────────────────────────
const FSO_LUNAR_MONTH_NAMES = ['正','二','三','四','五','六','七','八','九','十','冬','臘'];
const FSO_LUNAR_DAY_NAMES = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
];
const FSO_SHICHEN_ZHI  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const FSO_HUANGDAO_SHEN = ['青龍','明堂','天刑','朱雀','金匱','天德','白虎','玉堂','天牢','玄武','司命','勾陳'];
const FSO_HUANGDAO_JI  = {
  '青龍':true,'明堂':true,'天刑':false,'朱雀':false,
  '金匱':true,'天德':true,'白虎':false,'玉堂':true,
  '天牢':false,'玄武':false,'司命':true,'勾陳':false,
};
const FSO_RIZHI_QILONG = {
  '子':0,'午':0,'丑':1,'未':1,'寅':2,'申':2,
  '卯':3,'酉':3,'辰':4,'戌':4,'巳':5,'亥':5,
};
const FSO_JIANZHU = [
  { name:'建', yi:['嫁娶','開市','祭祀','祈福'], bad:false },
  { name:'除', yi:['移徙','出行','搬家','入宅'], bad:false },
  { name:'滿', yi:['開市','動土','興工','求財'], bad:false },
  { name:'平', yi:['嫁娶','祈福','安床','納采'], bad:false },
  { name:'定', yi:['出行','簽約','求財','納財'], bad:false },
  { name:'執', yi:['祭祀','祈福','入宅','安床'], bad:false },
  { name:'破', yi:['祭祀'],                       bad:true  },
  { name:'危', yi:['嫁娶','開市','安床','祈福'], bad:false },
  { name:'成', yi:['移徙','動土','嫁娶','開市','出行','簽約'], bad:false },
  { name:'收', yi:['嫁娶','求財','安床','祈福'], bad:false },
  { name:'開', yi:['嫁娶','開市','出行','動土','移徙','簽約'], bad:false },
  { name:'閉', yi:['安葬','祭祀'],               bad:true  },
];
const FSO_SPECIAL_DAYS_NOTIF = [
  { m:1,  d:1,  yi:['祭祀','祈福','嫁娶','開市'], bad:false },
  { m:1,  d:15, yi:['祭祀','祈福','嫁娶'],        bad:false },
  { m:2,  d:19, yi:['祭祀','祈福','求姻緣'],      bad:false },
  { m:5,  d:5,  yi:['祭祀','出行'],               bad:false },
  { m:7,  d:15, yi:['祭祀'],                      bad:true  },
  { m:8,  d:15, yi:['祭祀','祈福','賞月'],        bad:false },
  { m:9,  d:9,  yi:['祭祀','出行','登高'],        bad:false },
];
const FSO_FLY_ORDER  = ['中','西北','西','東北','南','北','西南','東','東南'];
const FSO_STAR_LABEL = { 1:'文昌', 2:'病符', 3:'是非', 4:'文昌', 5:'五黃', 6:'武曲', 7:'破軍', 8:'財運', 9:'喜慶' };

function fsoGetDayBranch(date) {
  var REF  = new Date(2000, 0, 1);
  var days = Math.round((date - REF) / 86400000);
  return FSO_SHICHEN_ZHI[((10 + days) % 12 + 12) % 12];
}

function fsoGetTopJiShi(date) {
  var branch   = fsoGetDayBranch(date);
  var startIdx = FSO_RIZHI_QILONG[branch] || 0;
  var results  = [];
  for (var i = 0; i < 12; i++) {
    var shen = FSO_HUANGDAO_SHEN[(startIdx + i) % 12];
    if (FSO_HUANGDAO_JI[shen]) {
      results.push(FSO_SHICHEN_ZHI[i] + '時');
      if (results.length >= 2) break;
    }
  }
  return results;
}

function fsoGetDayYiJiNotif(lunar) {
  var special = FSO_SPECIAL_DAYS_NOTIF.find(function(s) { return s.m === lunar.month && s.d === lunar.day; });
  if (special) return { bad: special.bad, yi: special.yi, jianchu: null };
  var FSO_MONTH_BRANCH = [2,3,4,5,6,7,8,9,10,11,0,1];
  var base = FSO_MONTH_BRANCH[lunar.month - 1];
  var idx  = ((lunar.day - 1) + base) % 12;
  var jz   = FSO_JIANZHU[idx];
  return { bad: jz.bad, yi: jz.yi, jianchu: jz.name };
}

function fsoGetAnnualStar(year) {
  var s = String(year).split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
  while (s > 9) s = String(s).split('').reduce(function(a, b) { return a + parseInt(b); }, 0);
  var c = 11 - s;
  if (c <= 0) c += 9;
  if (c > 9)  c -= 9;
  return c;
}

function fsoGetWangPos(year) {
  var center = fsoGetAnnualStar(year);
  var stars  = {};
  FSO_FLY_ORDER.forEach(function(dir, i) {
    var num = center + i;
    if (num > 9) num -= 9;
    stars[dir] = num;
  });
  var priority = [8, 9, 1];
  for (var pi = 0; pi < priority.length; pi++) {
    var target = priority[pi];
    for (var di = 1; di < FSO_FLY_ORDER.length; di++) { // skip 中
      var dir = FSO_FLY_ORDER[di];
      if (stars[dir] === target) return dir + '（' + FSO_STAR_LABEL[target] + '）';
    }
  }
  return '';
}

function fsoBuildDailyContent(date) {
  var lunar      = fsoSolarToLunar(date);
  var lunarStr   = FSO_LUNAR_MONTH_NAMES[lunar.month - 1] + '月' + FSO_LUNAR_DAY_NAMES[lunar.day - 1];
  var dayData    = fsoGetDayYiJiNotif(lunar);
  var jcLabel    = dayData.jianchu ? dayData.jianchu + '日' : (dayData.bad ? '凶日' : '吉日');
  var topYi      = dayData.yi.slice(0, 2).join('');
  var jiShi      = fsoGetTopJiShi(date);
  var wangPos    = fsoGetWangPos(date.getFullYear());
  return { lunarStr: lunarStr, jcLabel: jcLabel, topYi: topYi, jiShi: jiShi, wangPos: wangPos };
}

// ── Daily Horoscope Reminder ──
function fsoCheckDailyHoroscope() {
  alert('Step 1: function called');

  const s = fsoGetNotifSettings();
  alert('Step 2: settings = ' + JSON.stringify(s));

  if (s.dailyHoroscope === false) {
    alert('BLOCKED: dailyHoroscope=false');
    return;
  }

  alert('Step 3: passed dailyHoroscope check');

  const todayKey = fsoDayKey();
  const sent = JSON.parse(localStorage.getItem(FSO_NOTIF_DAILY_KEY) || '{}');
  alert('Step 4: todayKey=' + todayKey + '\nsent=' + JSON.stringify(sent));

  if (sent[todayKey]) {
    alert('BLOCKED: already sent today');
    return;
  }

  alert('Step 5: about to check user/premium');

  const now = new Date();

  let user = null;
  try { user = JSON.parse(localStorage.getItem('fs_auth_user')); } catch {}

  alert('Step 6: user=' + JSON.stringify(user));

  alert('Step 7b: Notification defined=' + (typeof Notification !== 'undefined') + '\npermission=' + (typeof Notification !== 'undefined' ? Notification.permission : 'N/A') + '\nSW in navigator=' + ('serviceWorker' in navigator));

  if (!user || !user.isPremium) {
    alert('Step 7: about to call fsoShowNotif (non-premium)');
    var nd = fsoGetNotifDayData(now);
    fsoShowNotif(
      '✨ 今日運勢 · ' + nd.lunarStr,
      nd.jcLabel + ' · 宜' + nd.topYi + '\n升級$48解鎖個人化吉時+旺位 👑',
      '/',
      'daily-upgrade'
    );
    sent[todayKey] = 'upgrade';
    localStorage.setItem(FSO_NOTIF_DAILY_KEY, JSON.stringify(sent));
    return;
  }

  alert('Step 7: about to call fsoShowNotif (premium)');
  const profiles = JSON.parse(localStorage.getItem('fengshui_profiles_v1') || '[]');
  const profileName = (profiles.length && profiles[0].name) ? profiles[0].name : (user.name || '您');
  const dc = fsoBuildDailyContent(new Date());
  const jiShiStr = dc.jiShi.length ? dc.jiShi.join('、') : '—';
  fsoShowNotif(
    '✨ 今日運勢 · ' + dc.lunarStr,
    dc.jcLabel + (dc.topYi ? ' · 宜' + dc.topYi : '') + '\n吉時：' + jiShiStr + (dc.wangPos ? '\n旺位：' + dc.wangPos : ''),
    '/calendar.html',
    'daily-horoscope'
  );
  sent[todayKey] = true;
  localStorage.setItem(FSO_NOTIF_DAILY_KEY, JSON.stringify(sent));
}

// ── Run all checks ──
function fsoRunNotifChecks() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  fsoCheckDeityBirthdays();
  fsoCheckUserBirthday();
  fsoCheckDailyHoroscope();
}

// ── Permission Banner ──
function fsoShouldShowBanner() {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted' || Notification.permission === 'denied') return false;
  const s = fsoGetNotifSettings();
  if (s.bannerDismissed) return false;
  return true;
}

function fsoIsIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function fsoIsStandalone() {
  return (navigator.standalone === true) || window.matchMedia('(display-mode: standalone)').matches;
}

function fsoShowPermBanner() {
  if (!fsoShouldShowBanner()) {
    if (Notification.permission === 'granted') fsoRunNotifChecks();
    return;
  }

  const isIOS = fsoIsIOS();
  const isStandalone = fsoIsStandalone();

  const banner = document.createElement('div');
  banner.id = 'fsoNotifBanner';
  banner.className = 'fso-notif-banner';

  if (isIOS && !isStandalone) {
    banner.innerHTML =
      '<div class="fso-nb-icon">📱</div>' +
      '<div class="fso-nb-content">' +
        '<div class="fso-nb-title">iPhone 用戶請先加至主畫面</div>' +
        '<div class="fso-nb-desc">Safari → 分享按鈕 <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;opacity:0.8"><path d="M12 2l-1.4 1.4L16.2 9H4v2h12.2l-5.6 5.6L12 18l8-8z" transform="rotate(-90 12 12)"/><rect x="3" y="19" width="18" height="2"/></svg> → 加至主畫面，即可接收神明聖誕及運程通知</div>' +
      '</div>' +
      '<button class="fso-nb-close" onclick="fsoDismissBanner()">✕</button>';
  } else {
    banner.innerHTML =
      '<div class="fso-nb-icon">🔔</div>' +
      '<div class="fso-nb-content">' +
        '<div class="fso-nb-title">接收每日運程、神明生日提醒</div>' +
        '<div class="fso-nb-desc">允許通知即可免費接收神明聖誕提醒及生日祝賀</div>' +
      '</div>' +
      '<div class="fso-nb-btns">' +
        '<button class="fso-nb-allow" onclick="fsoRequestPermission()">允許通知</button>' +
        '<button class="fso-nb-deny" onclick="fsoDismissBanner()">稍後</button>' +
      '</div>';
  }

  document.body.appendChild(banner);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { banner.classList.add('show'); });
  });
}

function fsoDismissBanner() {
  var banner = document.getElementById('fsoNotifBanner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(function() { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 400);
  }
  var s = fsoGetNotifSettings();
  s.bannerDismissed = true;
  fsoSaveNotifSettings(s);
}

function fsoRequestPermission() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(function(perm) {
    fsoDismissBanner();
    if (perm === 'granted') {
      var s = fsoGetNotifSettings();
      s.permitted = true;
      if (s.deityBirthdays === undefined) s.deityBirthdays = true;
      if (s.userBirthday === undefined)   s.userBirthday   = true;
      if (s.dailyHoroscope === undefined) s.dailyHoroscope = true;
      fsoSaveNotifSettings(s);
      fsoRunNotifChecks();
      if (typeof showToast === 'function') showToast('🔔 通知已開啟！');
    }
  });
}

// ── Notification Settings UI (called from auth.js renderSettingsModal) ──
function fsoRenderNotifSettings() {
  var s = fsoGetNotifSettings();
  var perm = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
  var isIOS = fsoIsIOS();
  var isStandalone = fsoIsStandalone();

  var iosWarning = (isIOS && !isStandalone)
    ? '<div class="fso-ns-ios-warn">📱 iPhone 用戶需先將 App 加至主畫面才可接收通知<br><span style="opacity:0.65;font-size:0.68rem;">Safari → 分享 → 加至主畫面</span></div>'
    : '';

  var permBlock = '';
  if (perm === 'unsupported') {
    permBlock = '<div class="fso-ns-status denied">此裝置不支援通知功能</div>';
  } else if (perm === 'denied') {
    permBlock = '<div class="fso-ns-status denied">⚠️ 通知權限已被拒絕，請在瀏覽器設定中重新開啟</div>';
  } else if (perm === 'default') {
    permBlock = '<div class="fso-ns-status pending"><button class="fso-ns-allow-btn" onclick="fsoRequestPermission();fsoRefreshNotifSettings()">🔔 立即開啟通知</button></div>';
  } else {
    permBlock = '<div class="fso-ns-status granted">✅ 通知已獲授權</div>';
  }

  var user = null;
  try { user = JSON.parse(localStorage.getItem('fs_auth_user')); } catch {}
  var isPremium = user && user.isPremium;

  var deityOn    = s.deityBirthdays !== false;
  var bdayOn     = s.userBirthday   !== false;
  var dailyOn    = s.dailyHoroscope !== false;

  var dailyRow = isPremium
    ? '<div class="fso-ns-row">' +
        '<div class="fso-ns-row-info">' +
          '<div class="fso-ns-row-label">✨ 每日運程提醒</div>' +
          '<div class="fso-ns-row-sub">每日早上8時推送今日運程（$48會員）</div>' +
        '</div>' +
        '<button class="settings-toggle ' + (dailyOn ? 'on' : '') + '" onclick="fsoToggleNotif(\'dailyHoroscope\',this)"></button>' +
      '</div>'
    : '<div class="fso-ns-row fso-ns-locked">' +
        '<div class="fso-ns-row-info">' +
          '<div class="fso-ns-row-label">✨ 每日運程提醒</div>' +
          '<div class="fso-ns-row-sub">每日早上8時推送今日運程（需升級 $48 會員）</div>' +
        '</div>' +
        '<button class="fso-ns-upgrade-btn" onclick="closeSettings();openSubscribeModal(\'monthly\')">升 級</button>' +
      '</div>';

  return '<div class="fso-notif-settings">' +
    iosWarning +
    permBlock +
    '<div class="fso-ns-row">' +
      '<div class="fso-ns-row-info">' +
        '<div class="fso-ns-row-label">🙏 神明聖誕提醒（免費）</div>' +
        '<div class="fso-ns-row-sub">提前1日通知12位神明聖誕</div>' +
      '</div>' +
      '<button class="settings-toggle ' + (deityOn ? 'on' : '') + '" onclick="fsoToggleNotif(\'deityBirthdays\',this)"></button>' +
    '</div>' +
    '<div class="fso-ns-row">' +
      '<div class="fso-ns-row-info">' +
        '<div class="fso-ns-row-label">🎂 生日祝賀（免費）</div>' +
        '<div class="fso-ns-row-sub">生日當日送上祝賀通知</div>' +
      '</div>' +
      '<button class="settings-toggle ' + (bdayOn ? 'on' : '') + '" onclick="fsoToggleNotif(\'userBirthday\',this)"></button>' +
    '</div>' +
    dailyRow +
  '</div>';
}

function fsoToggleNotif(key, btn) {
  var s = fsoGetNotifSettings();
  s[key] = !s[key];
  fsoSaveNotifSettings(s);
  btn.classList.toggle('on', s[key]);

  // If permission not granted yet, prompt
  if (s[key] && typeof Notification !== 'undefined' && Notification.permission === 'default') {
    fsoRequestPermission();
  }
}

function fsoRefreshNotifSettings() {
  // Re-render the settings modal if it's open
  if (typeof renderSettingsModal === 'function') {
    renderSettingsModal('settings');
  }
}

// ── Initialise on page load ──
document.addEventListener('DOMContentLoaded', function() {
  if (location.search.includes('debug=1') || location.hostname === 'localhost') {
    const p = document.getElementById('fsoDebugPanel');
    if (p) p.style.display = 'block';
  }
  fsoRegisterSW();
  // Show banner after 2s to not interrupt initial render
  setTimeout(fsoShowPermBanner, 2000);
  // Run checks if already granted
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    fsoRunNotifChecks();
  }
});
