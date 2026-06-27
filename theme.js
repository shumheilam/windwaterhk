/**
 * theme.js — 深色 / 淺色模式切換
 * 風生水起 windwaterhk · Siriis Labs
 *
 * - 用 localStorage key "fengshui_theme" 儲存偏好 ('light' | 'dark')
 * - 喺 <html> 元素加 .light-mode class
 * - 在 <head> 最早執行，避免頁面閃爍
 */
(function () {
  const STORAGE_KEY = 'fengshui_theme';

  // 立即套用（<head> 內執行，html 元素已存在）
  // 預設 light mode；只有用戶明確揀過 dark 才用深色
  const _saved = localStorage.getItem(STORAGE_KEY);
  if (_saved !== 'dark') {
    document.documentElement.classList.add('light-mode');
  }

  /** 更新按鈕圖示 */
  function syncIcon() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const isLight = document.documentElement.classList.contains('light-mode');
    btn.textContent = isLight ? '☀️' : '🌙';
    btn.setAttribute('title', isLight ? '切換深色模式' : '切換淺色模式');
    btn.setAttribute('aria-label', isLight ? '切換深色模式' : '切換淺色模式');
  }

  /** 切換主題 */
  window.toggleTheme = function () {
    const isLight = !document.documentElement.classList.contains('light-mode');
    document.documentElement.classList.toggle('light-mode', isLight);
    localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
    syncIcon();
  };

  // DOM 載入後同步按鈕圖示
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncIcon);
  } else {
    syncIcon();
  }
})();
