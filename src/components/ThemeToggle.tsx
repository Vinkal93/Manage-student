import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getTheme, setTheme, initTheme, type Theme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setCurrentTheme] = useState<Theme>('light');

  useEffect(() => {
    setCurrentTheme(initTheme());
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setCurrentTheme(next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
      title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
