import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Apply theme to document
 */
function applyTheme(effective: 'light' | 'dark') {
  const html = document.documentElement;
  const body = document.body;

  // Clear all theme classes
  html.classList.remove('ion-palette-dark', 'ion-palette-light');
  body.classList.remove('dark', 'light');

  // Set data-theme attribute (CSS targets this)
  html.setAttribute('data-theme', effective);

  // Add appropriate classes
  if (effective === 'dark') {
    html.classList.add('ion-palette-dark');
    body.classList.add('dark');
  } else {
    html.classList.add('ion-palette-light');
    body.classList.add('light');
  }
}

/**
 * Get effective theme
 */
function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    // Read initial from DOM (set by index.html script)
    const attr = document.documentElement.getAttribute('data-theme');
    return (attr === 'dark' || attr === 'light') ? attr : 'light';
  });

  const updateTheme = useCallback((newTheme: Theme) => {
    const effective = getEffectiveTheme(newTheme);
    setEffectiveTheme(effective);
    applyTheme(effective);
  }, []);

  // Load saved theme
  useEffect(() => {
    StorageService.getSettings().then(settings => {
      const savedTheme = settings.theme || 'auto';
      setThemeState(savedTheme);
      updateTheme(savedTheme);
    }).catch(() => {
      updateTheme('auto');
    });
  }, [updateTheme]);

  // Listen for system changes in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => updateTheme('auto');

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, updateTheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    updateTheme(newTheme);

    const settings = await StorageService.getSettings();
    await StorageService.saveSettings({ ...settings, theme: newTheme });
  }, [updateTheme]);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
