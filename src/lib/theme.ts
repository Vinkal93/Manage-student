const THEME_KEY = 'insuite_theme';

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme;
  if (saved) return saved;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function initTheme() {
  const theme = getTheme();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  return theme;
}
