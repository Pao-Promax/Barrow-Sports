'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('barrow-theme') as 'light' | 'dark' | null;
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('barrow-theme', next);
  };

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-8 h-8 rounded-xl glass-pill cursor-pointer"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
