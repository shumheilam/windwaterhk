/* ── FengShui Oracle — Web Push Notification System ── */

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
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const opts = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: tag || ('fso-' + Date.now()),
    data: { url: url || '/' },
    vibrate: [200, 100, 200],
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION', title: title, body: body, url: url || '/', tag: opts.tag
    });
  } else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(reg) {
      reg.showNotification(title, opts);
    }).catch(function() {
      new Notification(title, opts);
    });
  } else {
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

// ── Daily Horoscope Reminder ($48 member) ──
function fsoCheckDailyHoroscope() {
  const s = fsoGetNotifSettings();
  if (s.dailyHoroscope === false) return;

  const todayKey = fsoDayKey();
  const sent = JSON.parse(localStorage.getItem(FSO_NOTIF_DAILY_KEY) || '{}');
  if (sent[todayKey]) return;

  const now = new Date();
  const hour = now.getHours();

  // Before 8am — schedule for 8am
  if (hour < 8) {
    const target = new Date();
    target.setHours(8, 0, 0, 0);
    setTimeout(fsoCheckDailyHoroscope, target - now);
    return;
  }

  let user = null;
  try { user = JSON.parse(localStorage.getItem('fs_auth_user')); } catch {}

  if (!user || !user.isPremium) {
    // Non-premium: show upgrade prompt once per day if they enabled this toggle
    fsoShowNotif(
      '✨ 每日運程',
      '升級至 $48 玄學娛樂層，解鎖每日個人化運程推播 👑',
      '/',
      'daily-upgrade'
    );
    sent[todayKey] = 'upgrade';
    localStorage.setItem(FSO_NOTIF_DAILY_KEY, JSON.stringify(sent));
    return;
  }

  const profiles = JSON.parse(localStorage.getItem('fengshui_profiles_v1') || '[]');
  const profileName = (profiles.length && profiles[0].name) ? profiles[0].name : (user.name || '您');
  fsoShowNotif(
    '✨ 今日運程已更新',
    profileName + '，今日運程已更新，點擊查看',
    '/',
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
  fsoRegisterSW();
  // Show banner after 2s to not interrupt initial render
  setTimeout(fsoShowPermBanner, 2000);
  // Run checks if already granted
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    fsoRunNotifChecks();
  }
});
