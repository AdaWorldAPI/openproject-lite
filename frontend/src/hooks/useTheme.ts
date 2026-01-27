import { useState, useCallback, useEffect } from 'react';
import { applyBuiltInTheme, applyTheme, type Theme, openprojectTheme, darkTheme } from '../themes';

type ThemeName = 'light' | 'dark' | 'custom';

const STORAGE_KEY = 'op-lite-theme';

const builtInThemes: Record<string, Theme> = {
  light: openprojectTheme,
  dark: darkTheme,
};

function loadSavedTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'custom') {
      return saved;
    }
  } catch {
    // localStorage not available
  }
  return 'light';
}

export function useTheme() {
  const [themeName, setThemeNameState] = useState<ThemeName>(loadSavedTheme);

  useEffect(() => {
    if (themeName === 'light' || themeName === 'dark') {
      applyBuiltInTheme(themeName);
    }
  }, [themeName]);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch {
      // localStorage not available
    }
  }, []);

  const setCustomTheme = useCallback((theme: Theme) => {
    applyTheme(theme);
    setThemeNameState('custom');
    try {
      localStorage.setItem(STORAGE_KEY, 'custom');
    } catch {
      // localStorage not available
    }
  }, []);

  return {
    themeName,
    theme: builtInThemes[themeName] ?? openprojectTheme,
    setThemeName,
    setCustomTheme,
  };
}
