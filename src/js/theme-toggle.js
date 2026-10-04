// src/js/theme-toggle.js
// Syncs theme toggle buttons and persists the user's choice

const STORAGE_KEY = 'smartcareTheme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);

  // Update all toggle button labels
  document.querySelectorAll('.theme-switch, #portalThemeToggle, #portalHeaderThemeToggle').forEach(btn => {
    if (theme === 'dark') {
      btn.textContent = btn.id === 'portalHeaderThemeToggle' ? '☀️' : '☀️ Theme: Light';
    } else {
      btn.textContent = btn.id === 'portalHeaderThemeToggle' ? '🌙' : '🌙 Theme: Dark';
    }
  });
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
  // Set initial label based on current theme
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(saved);

  // Attach listeners to all toggle buttons
  document.querySelectorAll(
    '#themeToggle, #mobileThemeToggle, #portalThemeToggle, #portalHeaderThemeToggle'
  ).forEach(btn => {
    if (btn) btn.addEventListener('click', toggleTheme);
  });
});

