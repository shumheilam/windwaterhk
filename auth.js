/* ── FengShui Auth System (localStorage mock) ───── */

/* ── Mobile "更多" menu ─────────────────────────────
   Shared across index.html / oracle.html / calendar.html
   Requires: #mobMoreMenu, #mobMoreOverlay, .mob-more-btn
─────────────────────────────────────────────────── */
function toggleMobMore(e) {
  e.preventDefault();
  e.stopPropagation();
  const menu    = document.getElementById('mobMoreMenu');
  const overlay = document.getElementById('mobMoreOverlay');
  const btn     = document.getElementById('mobMoreTrigger');
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  if (isOpen) {
    menu.classList.remove('open');
    overlay && overlay.classList.remove('open');
    btn  && btn.classList.remove('menu-open');
  } else {
    menu.classList.add('open');
    overlay && overlay.classList.add('open');
    btn  && btn.classList.add('menu-open');
  }
}

function closeMobMore() {
  const menu    = document.getElementById('mobMoreMenu');
  const overlay = document.getElementById('mobMoreOverlay');
  const btn     = document.getElementById('mobMoreTrigger');
  if (menu)    menu.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (btn)     btn.classList.remove('menu-open');
}

// Close 更多 menu when tapping any other tab
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobMoreMenu');
  if (!menu || !menu.classList.contains('open')) return;
  const trigger = document.getElementById('mobMoreTrigger');
  if (trigger && trigger.contains(e.target)) return; // handled by toggleMobMore
  if (!menu.contains(e.target)) closeMobMore();
});

const AUTH_KEY   = 'fs_auth_user';
const TOAST_DURATION = 2400;

// ── State ────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}
function setUser(u) { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function clearUser() { localStorage.removeItem(AUTH_KEY); }

// ── Helpers ──────────────────────────────────────
function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.trim().slice(0, 2).toUpperCase();
  }
  return (email || '?')[0].toUpperCase();
}

function showToast(msg) {
  let t = document.getElementById('authToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'authToast';
    t.className = 'auth-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), TOAST_DURATION);
}

// ── Render nav auth area ─────────────────────────
function renderAuthNav() {
  const wrap = document.getElementById('navAuthArea');
  if (!wrap) return;
  const user = getUser();

  if (!user) {
    wrap.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;">
        <button class="nav-upgrade-btn" onclick="openSubscribeModal('monthly')">✦ $48/月起</button>
        <button class="nav-auth-btn" onclick="openAuthModal()">登 入 ／ 註 冊</button>
      </div>`;
  } else {
    const initials = getInitials(user.name, user.email);
    const premiumClass = user.isPremium ? ' premium' : '';
    const crown = user.isPremium ? '<span class="nav-avatar-crown">👑</span>' : '';
    const upgradeBtn = !user.isPremium
      ? `<button class="nav-upgrade-btn" onclick="openSubscribeModal('monthly')" style="margin-right:0.5rem;">✦ $48/月起</button>` : '';
    wrap.innerHTML = `
      ${upgradeBtn}<div class="nav-avatar-wrap">
        <div class="nav-avatar${premiumClass}" onclick="toggleDropdown()" id="navAvatar">${initials}</div>
        ${crown}
        <div class="nav-dropdown" id="navDropdown">
          <div class="nav-dropdown-header">
            <div class="nav-dd-name">${user.name || user.email}</div>
            <div class="nav-dd-email">${user.email}</div>
            <span class="nav-dd-badge ${user.isPremium ? 'premium' : 'free'}">${user.isPremium ? '✦ 月費會員' : '免費版'}</span>
          </div>
          <button class="nav-dd-item" onclick="openSubscriptions()">📜 &nbsp;我的訂閱</button>
          <button class="nav-dd-item" onclick="openSettings()">⚙️ &nbsp;設 定</button>
          <div class="nav-dd-sep"></div>
          <button class="nav-dd-item danger" onclick="doLogout()">↩ &nbsp;登 出</button>
        </div>
      </div>`;
  }
}

function toggleDropdown() {
  const dd = document.getElementById('navDropdown');
  if (dd) dd.classList.toggle('open');
}

// Close dropdown on outside click
document.addEventListener('click', function(e) {
  const wrap = document.querySelector('.nav-avatar-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const dd = document.getElementById('navDropdown');
    if (dd) dd.classList.remove('open');
  }
});

// ── Modal open/close ─────────────────────────────
function openAuthModal(defaultTab) {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  switchAuthTab(defaultTab || 'login');
  clearAuthErrors();
}

function closeAuthModal() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.classList.remove('open');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
  clearAuthErrors();
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(e => e.textContent = '');
}

// Close on overlay background click
document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeAuthModal();
    });
  }
  const settingsOverlay = document.getElementById('settingsOverlay');
  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', function(e) {
      if (e.target === settingsOverlay) closeSettings();
    });
  }
  injectSubscribeModal();
  renderAuthNav();
  updatePremiumWalls();
});

// ── Login ────────────────────────────────────────
function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const err   = document.getElementById('loginError');

  if (!email || !pass) { err.textContent = '請填寫電郵及密碼'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = '請輸入有效電郵地址'; return; }
  if (pass.length < 6) { err.textContent = '密碼最少6位'; return; }

  // Check existing user
  const existing = getStoredAccounts().find(a => a.email === email);
  if (!existing) { err.textContent = '找不到此帳號，請先註冊'; return; }
  if (existing.password !== pass) { err.textContent = '密碼錯誤，請重試'; return; }

  const user = { email: existing.email, name: existing.name, isPremium: existing.isPremium || false };
  setUser(user);
  closeAuthModal();
  renderAuthNav();
  updatePremiumWalls();
  showToast('✦ 歡迎回來，' + (user.name || user.email));
}

// ── Register ─────────────────────────────────────
function doRegister() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const err   = document.getElementById('regError');

  if (!name)  { err.textContent = '請填寫姓名'; return; }
  if (!email) { err.textContent = '請填寫電郵'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = '請輸入有效電郵地址'; return; }
  if (!pass || pass.length < 6) { err.textContent = '密碼最少6位'; return; }
  if (pass !== pass2) { err.textContent = '兩次密碼不一致'; return; }

  const accounts = getStoredAccounts();
  if (accounts.find(a => a.email === email)) { err.textContent = '此電郵已被註冊'; return; }

  const newAccount = { email, name, password: pass, isPremium: false };
  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  const user = { email, name, isPremium: false };
  setUser(user);
  closeAuthModal();
  renderAuthNav();
  updatePremiumWalls();
  showToast('✦ 註冊成功，歡迎加入！');
}

// ── Google mock login ────────────────────────────
function doGoogleLogin() {
  const mockName  = '測試用戶';
  const mockEmail = 'user@gmail.com';

  const accounts = getStoredAccounts();
  if (!accounts.find(a => a.email === mockEmail)) {
    accounts.push({ email: mockEmail, name: mockName, password: '', isPremium: false });
    saveStoredAccounts(accounts);
  }

  const user = { email: mockEmail, name: mockName, isPremium: false };
  setUser(user);
  closeAuthModal();
  renderAuthNav();
  updatePremiumWalls();
  showToast('✦ Google 登入成功（示範模式）');
}

// ── Logout ───────────────────────────────────────
function doLogout() {
  const dd = document.getElementById('navDropdown');
  if (dd) dd.classList.remove('open');
  clearUser();
  renderAuthNav();
  updatePremiumWalls();
  showToast('已登出');
}

// ── Account storage helpers ──────────────────────
function getStoredAccounts() {
  try { return JSON.parse(localStorage.getItem('fs_accounts') || '[]'); } catch { return []; }
}
function saveStoredAccounts(arr) { localStorage.setItem('fs_accounts', JSON.stringify(arr)); }

// ── Subscriptions modal (reuse settings overlay) ─
function openSubscriptions() {
  const dd = document.getElementById('navDropdown');
  if (dd) dd.classList.remove('open');
  openSettings('subs');
}

// ── Settings modal ───────────────────────────────
function openSettings(view) {
  const dd = document.getElementById('navDropdown');
  if (dd) dd.classList.remove('open');
  const overlay = document.getElementById('settingsOverlay');
  if (overlay) {
    renderSettingsModal(view || 'settings');
    overlay.classList.add('open');
  }
}

function closeSettings() {
  const overlay = document.getElementById('settingsOverlay');
  if (overlay) overlay.classList.remove('open');
}

function renderSettingsModal(view) {
  const user = getUser();
  const body = document.getElementById('settingsBody');
  if (!body) return;

  if (view === 'subs') {
    const premiumHTML = user && user.isPremium
      ? `<div style="font-size:0.82rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:0.8rem;">✦ 月費會員生效中</div>
         <div style="font-size:0.7rem;color:var(--text-dim);letter-spacing:0.06em;line-height:2;">到期日：2026年12月31日<br>自動續期：已開啟</div>
         <button class="subs-upgrade-btn" style="margin-top:0.9rem;border-color:rgba(180,50,50,0.4);color:#cc7777;" onclick="mockCancelSubs()">取消訂閱</button>`
      : `<div class="subs-status">目前：免費版</div>
         <div style="font-size:0.72rem;color:var(--text-dim);letter-spacing:0.06em;line-height:2;margin-bottom:0.8rem;">玄學娛樂層 HKD$48/月 · 人生決策層 HKD$98/月<br>解鎖深度命盤、流年運程、無限求簽等</div>
         <button class="subs-upgrade-btn" onclick="mockUpgrade()">✦ 立即升級月費會員</button>`;

    body.innerHTML = `
      <div class="settings-title">我 的 訂 閱</div>
      <div class="subs-section">${premiumHTML}</div>
      <button class="auth-submit" style="margin-top:1.2rem;" onclick="closeSettings()">關 閉</button>`;
  } else {
    const isPrem = user && user.isPremium;
    const notifSection = (typeof fsoRenderNotifSettings === 'function')
      ? `<div class="settings-row" style="display:block;padding:0.6rem 0 0;">
           <div class="settings-row-label" style="margin-bottom:0.55rem;">🔔 通知設定</div>
           ${fsoRenderNotifSettings()}
         </div>`
      : '';
    body.innerHTML = `
      <div class="settings-title">設 定</div>
      <div class="settings-row">
        <div>
          <div class="settings-row-label">帳號資料</div>
          <div class="settings-row-sub">${user ? user.email : '—'}</div>
        </div>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-label">會員狀態</div>
          <div class="settings-row-sub">${isPrem ? '月費會員 ✦' : '免費版'}</div>
        </div>
        ${!isPrem ? `<button class="nav-auth-btn" style="font-size:0.65rem;" onclick="openSubscriptions()">升 級</button>` : ''}
      </div>
      ${notifSection}
      <div class="settings-row">
        <div>
          <div class="settings-row-label">⚠️ 示範：切換 Premium</div>
          <div class="settings-row-sub">模擬付費狀態（測試用）</div>
        </div>
        <button class="settings-toggle ${isPrem ? 'on' : ''}" id="premToggle" onclick="togglePremiumMock()"></button>
      </div>
      <button class="auth-submit" style="margin-top:1.2rem;" onclick="closeSettings()">完 成</button>`;
  }
}

function togglePremiumMock() {
  const user = getUser();
  if (!user) return;
  user.isPremium = !user.isPremium;
  setUser(user);

  // Update stored account too
  const accounts = getStoredAccounts();
  const acc = accounts.find(a => a.email === user.email);
  if (acc) { acc.isPremium = user.isPremium; saveStoredAccounts(accounts); }

  const btn = document.getElementById('premToggle');
  if (btn) btn.classList.toggle('on', user.isPremium);
  renderAuthNav();
  updatePremiumWalls();
  showToast(user.isPremium ? '✦ Premium 已開啟（示範）' : 'Premium 已關閉');
}

function mockUpgrade() {
  const user = getUser();
  if (!user) return;
  user.isPremium = true;
  setUser(user);
  const accounts = getStoredAccounts();
  const acc = accounts.find(a => a.email === user.email);
  if (acc) { acc.isPremium = true; saveStoredAccounts(accounts); }
  closeSettings();
  renderAuthNav();
  updatePremiumWalls();
  showToast('✦ 已升級月費會員！（示範模式）');
}

function mockCancelSubs() {
  const user = getUser();
  if (!user) return;
  user.isPremium = false;
  setUser(user);
  const accounts = getStoredAccounts();
  const acc = accounts.find(a => a.email === user.email);
  if (acc) { acc.isPremium = false; saveStoredAccounts(accounts); }
  closeSettings();
  renderAuthNav();
  updatePremiumWalls();
  showToast('訂閱已取消');
}

// ── Subscription Modal ───────────────────────────
function injectSubscribeModal() {
  if (document.getElementById('subsOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'subsOverlay';
  overlay.className = 'subs-overlay';
  overlay.innerHTML = `
    <div class="subs-modal" id="subsModal">
      <button class="subs-close" onclick="closeSubscribeModal()">✕</button>
      <div class="subs-modal-inner">
        <div class="subs-header">
          <div class="subs-header-icon">👑</div>
          <div class="subs-header-title">升 級 會 員</div>
          <div class="subs-header-sub">$48/月起 · 按需選擇 · 隨時取消</div>
        </div>

        <!-- 6 report types -->
        <div style="padding:0.6rem 0.2rem 0.2rem;text-align:center;">
          <div style="font-size:0.65rem;color:var(--text-dim);letter-spacing:0.15em;margin-bottom:0.45rem;">✦ 6 類 AI 命 理 報 告 ✦</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.35rem;justify-content:center;">
            <span class="subs-report-chip">💕 感情運勢</span>
            <span class="subs-report-chip">💼 事業財運</span>
            <span class="subs-report-chip">🌿 健康運勢</span>
            <span class="subs-report-chip">📅 流年逐月</span>
            <span class="subs-report-chip">💑 合婚配對</span>
            <span class="subs-report-chip">📆 擇日建議</span>
          </div>
        </div>

        <div class="subs-tabs" style="margin-top:0.7rem;">
          <button class="subs-tab active" data-stab="monthly" onclick="switchSubsTab('monthly')">月 費 計 劃</button>
          <button class="subs-tab" data-stab="single" onclick="switchSubsTab('single')">單 次 報 告</button>
        </div>
        <div class="subs-panel active" id="subsTabMonthly">

          <!-- Tier comparison table -->
          <div style="margin-bottom:0.8rem;overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.62rem;letter-spacing:0.05em;">
              <thead>
                <tr>
                  <th style="padding:0.4rem 0.3rem;text-align:left;color:var(--text-dim);font-weight:400;border-bottom:1px solid rgba(255,255,255,0.08);"></th>
                  <th style="padding:0.4rem 0.3rem;text-align:center;color:var(--text-dim);font-weight:400;border-bottom:1px solid rgba(255,255,255,0.08);">免費</th>
                  <th style="padding:0.4rem 0.3rem;text-align:center;color:var(--gold);font-weight:600;border-bottom:1px solid rgba(201,168,76,0.3);">$48/月</th>
                  <th style="padding:0.4rem 0.3rem;text-align:center;color:#e8d080;font-weight:600;border-bottom:1px solid rgba(232,208,128,0.4);">$98/月</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:0.38rem 0.3rem;color:var(--text-dim);">每月AI報告數量</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--text-dim);">0份</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--gold);">1份</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:#e8d080;">3份</td>
                </tr>
                <tr style="background:rgba(255,255,255,0.02);">
                  <td style="padding:0.38rem 0.3rem;color:var(--text-dim);">報告類型選擇</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--text-dim);">❌</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--gold);">選1類</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:#e8d080;">任選3類</td>
                </tr>
                <tr>
                  <td style="padding:0.38rem 0.3rem;color:var(--text-dim);">AI對話問答</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--text-dim);">3條</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--gold);">10條/月</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:#e8d080;">無限</td>
                </tr>
                <tr style="background:rgba(255,255,255,0.02);">
                  <td style="padding:0.38rem 0.3rem;color:var(--text-dim);">求簽次數</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--text-dim);">每日1次</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--gold);">無限</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:#e8d080;">無限</td>
                </tr>
                <tr>
                  <td style="padding:0.38rem 0.3rem;color:var(--text-dim);">基本命盤功能</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;">✅</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;">✅</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;">✅</td>
                </tr>
                <tr style="background:rgba(255,255,255,0.02);">
                  <td style="padding:0.38rem 0.3rem;color:var(--text-dim);">報告歷史保存</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--text-dim);">❌</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--gold);">✅</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:#e8d080;">✅</td>
                </tr>
                <tr>
                  <td style="padding:0.38rem 0.3rem;color:var(--text-dim);">用戶檔案數量</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--text-dim);">3個</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:var(--gold);">10個</td>
                  <td style="padding:0.38rem 0.3rem;text-align:center;color:#e8d080;">無限</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tier 1: $48 -->
          <div class="subs-plan-box">
            <div class="subs-plan-tier-label">玄 學 娛 樂</div>
            <div class="subs-plan-price">HKD$48<span>&nbsp;/月</span></div>
            <div class="subs-plan-desc">隨時取消 · 立即生效</div>
            <div class="subs-features">
              <div class="subs-feature subs-feature-highlight"><span class="subs-feature-check">✦</span><strong>每月 1 份 AI 命理報告（任選 1 類）</strong></div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>無限求簽 · AI 深度解籤</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>風水問答 10 條 / 月</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>每日運程推播通知</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>犯太歲化解方法</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>旺身方向 · 首飾 · 身體建議</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>用戶檔案最多 10 個</div>
            </div>
            <button class="subs-subscribe-btn" onclick="doMockSubscribe('monthly-48')">訂 閱 · $48/月</button>
          </div>

          <!-- Tier 2: $98 recommended -->
          <div class="subs-plan-box" style="margin-top:0.9rem;border-color:rgba(201,168,76,0.55);background:rgba(201,168,76,0.04)">
            <div class="subs-plan-tier-label" style="color:#e8d080;border-color:rgba(232,208,128,0.5)">✦ 推 薦 · 人 生 決 策</div>
            <div class="subs-plan-price">HKD$98<span>&nbsp;/月</span></div>
            <div class="subs-plan-desc">包含所有 $48 功能 · 更多深度分析</div>
            <div class="subs-features">
              <div class="subs-feature subs-feature-highlight" style="color:#e8d080;"><span class="subs-feature-check" style="color:#e8d080;">✦</span><strong>每月 3 份 AI 命理報告（任選 3 類）</strong></div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>無限求簽 · AI 深度解籤</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>無限風水問答</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>AI 命盤深度分析</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>每日運程推播通知</div>
              <div class="subs-feature"><span class="subs-feature-check">✦</span>無限用戶檔案</div>
            </div>
            <button class="subs-subscribe-btn" onclick="doMockSubscribe('monthly-98')" style="background:linear-gradient(135deg,#6b1010,#9b2020 50%,#6b1010);border-color:#e8d080;color:#e8d080">訂 閱 · $98/月</button>
          </div>

          <div class="subs-safe-note" style="margin-top:0.8rem">🔒 安全付款 · Mock 示範模式 · 不會扣款</div>
        </div>
        <div class="subs-panel" id="subsTabSingle">
          <!-- Type A: 月費報告單次試用 $38 -->
          <div style="font-size:0.63rem;color:var(--gold);letter-spacing:0.12em;margin:0 0 0.4rem;padding:0.3rem 0.5rem 0.1rem;border-bottom:1px solid rgba(201,168,76,0.15);">
            ▸ 月費報告單次試用（HKD$38）
          </div>
          <div style="font-size:0.6rem;color:var(--text-dim);letter-spacing:0.07em;margin-bottom:0.5rem;">一次性報告 · 永久保存 · 冇問答額度 · 冇求簽加成</div>
          <div class="subs-report-list">
            <div class="subs-report-item" onclick="selectReport(this,'感情運勢AI報告','HKD$38')">
              <div class="subs-report-left">
                <div class="subs-report-icon">💕</div>
                <div><div class="subs-report-name">感情運勢</div><div class="subs-report-desc">本月感情發展 · 桃花運 · 注意事項</div></div>
              </div>
              <div class="subs-report-price">HKD$38</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'事業財運AI報告','HKD$38')">
              <div class="subs-report-left">
                <div class="subs-report-icon">💼</div>
                <div><div class="subs-report-name">事業財運</div><div class="subs-report-desc">本月事業機遇 · 財運走向 · 投資建議</div></div>
              </div>
              <div class="subs-report-price">HKD$38</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'健康運勢AI報告','HKD$38')">
              <div class="subs-report-left">
                <div class="subs-report-icon">🌿</div>
                <div><div class="subs-report-name">健康運勢</div><div class="subs-report-desc">本月健康注意部位 · 養生建議</div></div>
              </div>
              <div class="subs-report-price">HKD$38</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'流年逐月AI報告','HKD$38')">
              <div class="subs-report-left">
                <div class="subs-report-icon">📅</div>
                <div><div class="subs-report-name">流年逐月</div><div class="subs-report-desc">本月整體運勢 · 吉凶提示</div></div>
              </div>
              <div class="subs-report-price">HKD$38</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'合婚配對AI報告','HKD$38')">
              <div class="subs-report-left">
                <div class="subs-report-icon">💑</div>
                <div><div class="subs-report-name">合婚配對</div><div class="subs-report-desc">兩人本月相處運勢 · 溝通建議</div></div>
              </div>
              <div class="subs-report-price">HKD$38</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'擇日建議AI報告','HKD$38')">
              <div class="subs-report-left">
                <div class="subs-report-icon">📆</div>
                <div><div class="subs-report-name">擇日建議</div><div class="subs-report-desc">本月最佳行事吉日推薦</div></div>
              </div>
              <div class="subs-report-price">HKD$38</div>
            </div>
          </div>

          <!-- Type B: 深度專項報告 -->
          <div style="font-size:0.63rem;color:var(--gold);letter-spacing:0.12em;margin:0.8rem 0 0.4rem;padding:0.3rem 0.5rem 0.1rem;border-bottom:1px solid rgba(201,168,76,0.15);">
            ▸ 深度專項報告
          </div>
          <div class="subs-report-list">
            <div class="subs-report-item" onclick="selectReport(this,'另一半性格外貌分析','HKD$58')">
              <div class="subs-report-left">
                <div class="subs-report-icon">💑</div>
                <div><div class="subs-report-name">另一半性格外貌分析</div><div class="subs-report-desc">推算另一半命格特質</div></div>
              </div>
              <div class="subs-report-price">HKD$58</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'子女緣分析','HKD$58')">
              <div class="subs-report-left">
                <div class="subs-report-icon">👶</div>
                <div><div class="subs-report-name">子女緣分析</div><div class="subs-report-desc">子嗣緣份深度分析</div></div>
              </div>
              <div class="subs-report-price">HKD$58</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'兄弟姊妹緣分析','HKD$58')">
              <div class="subs-report-left">
                <div class="subs-report-icon">👫</div>
                <div><div class="subs-report-name">兄弟姊妹緣分析</div><div class="subs-report-desc">手足緣份及互動關係</div></div>
              </div>
              <div class="subs-report-price">HKD$58</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'血光之災提示','HKD$58')">
              <div class="subs-report-left">
                <div class="subs-report-icon">🩸</div>
                <div><div class="subs-report-name">血光之災提示</div><div class="subs-report-desc">化解方法 · 注意時段</div></div>
              </div>
              <div class="subs-report-price">HKD$58</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'面相深度報告','HKD$68')">
              <div class="subs-report-left">
                <div class="subs-report-icon">👁</div>
                <div><div class="subs-report-name">面相深度報告</div><div class="subs-report-desc">五官格局 · 性格運勢分析</div></div>
              </div>
              <div class="subs-report-price">HKD$68</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'手相深度報告','HKD$68')">
              <div class="subs-report-left">
                <div class="subs-report-icon">🖐</div>
                <div><div class="subs-report-name">手相深度報告</div><div class="subs-report-desc">生命線 · 感情線 · 財運線</div></div>
              </div>
              <div class="subs-report-price">HKD$68</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'深度改名報告','HKD$128')">
              <div class="subs-report-left">
                <div class="subs-report-icon">✍️</div>
                <div><div class="subs-report-name">深度改名報告</div><div class="subs-report-desc">五行補缺 · 康熙筆劃分析<br><span style="color:rgba(201,168,76,0.7);">$98 會員：HKD$90（7折）</span></div></div>
              </div>
              <div class="subs-report-price">HKD$128</div>
            </div>
            <div class="subs-report-item" onclick="selectReport(this,'奇門遁甲完整盤','HKD$198')">
              <div class="subs-report-left">
                <div class="subs-report-icon">☰</div>
                <div><div class="subs-report-name">奇門遁甲完整盤</div><div class="subs-report-desc">八門九星完整時盤分析<br><span style="color:rgba(201,168,76,0.7);">$98 會員：HKD$139（7折）</span></div></div>
              </div>
              <div class="subs-report-price">HKD$198</div>
            </div>
          </div>
          <button class="subs-report-btn" id="subsReportBtn" onclick="doMockSubscribe('single')" disabled style="opacity:0.45;">
            請先選擇報告
          </button>
          <div class="subs-safe-note">🔒 安全付款 · Mock 示範模式 · 不會扣款</div>
        </div>
      </div>
    </div>`;

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeSubscribeModal();
  });
  document.body.appendChild(overlay);

  // Particle canvas
  if (!document.getElementById('goldParticleCanvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'goldParticleCanvas';
    document.body.appendChild(canvas);
  }

  // Success banner
  if (!document.getElementById('premiumSuccessBanner')) {
    const banner = document.createElement('div');
    banner.id = 'premiumSuccessBanner';
    banner.className = 'premium-success-banner';
    banner.innerHTML = `
      <div class="psb-crown">👑</div>
      <div class="psb-title">歡迎成為會員</div>
      <div class="psb-sub">所有付費功能已解鎖<br>感謝支持風生水起</div>`;
    document.body.appendChild(banner);
  }
}

function openSubscribeModal(tab) {
  const user = getUser();
  if (!user) {
    showToast('請先登入才可訂閱');
    openAuthModal();
    return;
  }
  if (user.isPremium) {
    showToast('✦ 你已經是月費會員！');
    return;
  }
  injectSubscribeModal();
  const overlay = document.getElementById('subsOverlay');
  if (overlay) overlay.classList.add('open');
  switchSubsTab(tab || 'monthly');
  window._subsSelectedReport = null;
  window._subsSelectedPrice = null;
}

function closeSubscribeModal() {
  const overlay = document.getElementById('subsOverlay');
  if (overlay) overlay.classList.remove('open');
}

function switchSubsTab(tab) {
  document.querySelectorAll('.subs-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.stab === tab));
  document.querySelectorAll('.subs-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(tab === 'monthly' ? 'subsTabMonthly' : 'subsTabSingle');
  if (panel) panel.classList.add('active');
}

function selectReport(el, name, price) {
  document.querySelectorAll('.subs-report-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  window._subsSelectedReport = name;
  window._subsSelectedPrice = price;
  const btn = document.getElementById('subsReportBtn');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.textContent = `立 即 購 買 · ${price}`;
  }
}

function doMockSubscribe(type) {
  closeSubscribeModal();

  const user = getUser();
  if (user) {
    user.isPremium = true;
    setUser(user);
    const accounts = getStoredAccounts();
    const acc = accounts.find(a => a.email === user.email);
    if (acc) { acc.isPremium = true; saveStoredAccounts(accounts); }
  }

  renderAuthNav();
  updatePremiumWalls();
  fireGoldParticles();
  showPremiumSuccessBanner();
}

function fireGoldParticles() {
  const canvas = document.getElementById('goldParticleCanvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');
  const ctx = canvas.getContext('2d');

  const particles = [];
  const colors = ['#f0d060','#c9a84c','#e8d080','#ffffff','#ffea80'];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      r: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      gravity: 0.18 + Math.random() * 0.12,
      decay: 0.012 + Math.random() * 0.012,
    });
  }

  let frame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.alpha <= 0) return;
      alive = true;
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.alpha -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.classList.remove('active');
      cancelAnimationFrame(frame);
    }
  }
  requestAnimationFrame(animate);
}

function showPremiumSuccessBanner() {
  const banner = document.getElementById('premiumSuccessBanner');
  if (!banner) return;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 2800);
}

// ── Premium wall integration ─────────────────────
function updatePremiumWalls() {
  const user = getUser();
  const isPremium = user && user.isPremium;

  // Unlock / lock AI sections (index.html)
  document.querySelectorAll('.ai-sec-locked').forEach(sec => {
    if (isPremium) {
      sec.classList.remove('ai-sec-locked');
      const lockBar = sec.querySelector('.ai-lock-bar');
      if (lockBar) lockBar.remove();
    }
  });

  // Update upgrade buttons text / onclick
  document.querySelectorAll('.da-upgrade-btn').forEach(btn => {
    if (isPremium) {
      btn.textContent = '✦ 已解鎖月費功能';
      btn.disabled = true;
      btn.style.opacity = '0.55';
      btn.onclick = null;
    } else {
      btn.onclick = function() { openSubscribeModal('monthly'); };
    }
  });

  // Wire all generic upgrade/unlock buttons
  document.querySelectorAll('.match-unlock-btn').forEach(btn => {
    if (!isPremium) btn.onclick = function() { openSubscribeModal('single'); };
    else { btn.textContent = '✦ 已解鎖'; btn.disabled = true; btn.style.opacity = '0.55'; }
  });
  document.querySelectorAll('.rn-unlock-btn').forEach(btn => {
    if (!isPremium) btn.onclick = function() { openSubscribeModal('single'); };
    else { btn.textContent = '✦ 已解鎖'; btn.disabled = true; btn.style.opacity = '0.55'; }
  });
  document.querySelectorAll('.ai-unlock-btn').forEach(btn => {
    if (!isPremium) btn.onclick = function() { openSubscribeModal('monthly'); };
    else { btn.textContent = '✦ 已解鎖'; btn.disabled = true; btn.style.opacity = '0.55'; }
  });
  document.querySelectorAll('.da-report-unlock').forEach(btn => {
    if (!isPremium) btn.onclick = function() { openSubscribeModal('single'); };
  });

  // Unlock locked da-cards
  if (isPremium) {
    document.querySelectorAll('.da-locked-card').forEach(card => {
      card.style.opacity = '0.85';
      const blur = card.querySelector('.da-locked-blur');
      if (blur) { blur.style.filter = 'none'; blur.style.color = 'var(--text)'; }
      const icon = card.querySelector('.da-lock-icon');
      if (icon) icon.textContent = '✓';
    });
  }
}
