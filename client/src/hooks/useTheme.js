import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage theme state (light / dark).
 * Persists choice to localStorage and applies 'data-theme' to documentElement.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback if localStorage access is restricted
    }
    return 'light';
  });

  const isDark = theme === 'dark';

  const applyTheme = useCallback((newTheme) => {
    const validTheme = newTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', validTheme);
    document.body.className = validTheme;
    try {
      localStorage.setItem('theme', validTheme);
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [applyTheme]);

  const setTheme = useCallback((newTheme) => {
    const validTheme = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(validTheme);
    applyTheme(validTheme);
  }, [applyTheme]);

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };
}

export default useTheme;
