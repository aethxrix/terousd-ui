import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

const STORAGE_DARK = 'dark-mode';
const STORAGE_ULTRA = 'isUltraDarkThemeEnabled';

function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
}

function applyDom(isDark: boolean, isUltra: boolean) {
  document.body.setAttribute('class', isDark ? 'dark' : 'light');
  if (isUltra) {
    document.documentElement.setAttribute('data-theme', 'ultra-dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const msg = document.getElementById('message');
  if (msg) msg.className = isDark ? 'dark' : 'light';
}

// module load so the document is in the right theme before React mounts.
const initialDark = readBool(STORAGE_DARK, true);
const initialUltra = readBool(STORAGE_ULTRA, false);
applyDom(initialDark, initialUltra);

const DARK_TOKENS = {
  colorPrimary: '#7c3aed',
  colorInfo: '#22d3ee',
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  colorError: '#f43f5e',
  colorBgBase: '#0b1020',
  colorBgLayout: '#0b1020',
  colorBgContainer: '#12182a',
  colorBgElevated: '#182033',
  colorBorder: 'rgba(148, 163, 184, 0.18)',
  colorBorderSecondary: 'rgba(148, 163, 184, 0.12)',
};
const ULTRA_DARK_TOKENS = {
  colorPrimary: '#8b5cf6',
  colorInfo: '#22d3ee',
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  colorError: '#fb7185',
  colorBgBase: '#030712',
  colorBgLayout: '#030712',
  colorBgContainer: '#080d1a',
  colorBgElevated: '#0f172a',
  colorBorder: 'rgba(148, 163, 184, 0.14)',
  colorBorderSecondary: 'rgba(148, 163, 184, 0.08)',
};
const DARK_LAYOUT_TOKENS = {
  bodyBg: '#0b1020',
  headerBg: '#0f172a',
  headerColor: '#ffffff',
  footerBg: '#0b1020',
  siderBg: '#0a0f1f',
  triggerBg: '#151b2e',
  triggerColor: '#ffffff',
};
const ULTRA_DARK_LAYOUT_TOKENS = {
  bodyBg: '#030712',
  headerBg: '#050816',
  headerColor: '#ffffff',
  footerBg: '#030712',
  siderBg: '#030712',
  triggerBg: '#111827',
  triggerColor: '#ffffff',
};
const DARK_MENU_TOKENS = {
  darkItemBg: '#0a0f1f',
  darkSubMenuItemBg: '#111827',
  darkPopupBg: '#182033',
  darkItemSelectedBg: 'rgba(124, 58, 237, 0.22)',
  darkItemSelectedColor: '#ffffff',
};
const ULTRA_DARK_MENU_TOKENS = {
  darkItemBg: '#030712',
  darkSubMenuItemBg: '#060a14',
  darkPopupBg: '#0f172a',
  darkItemSelectedBg: 'rgba(139, 92, 246, 0.24)',
  darkItemSelectedColor: '#ffffff',
};
const DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(148, 163, 184, 0.14)',
};
const ULTRA_DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(148, 163, 184, 0.10)',
};
const STATISTIC_TOKENS = {
  contentFontSize: 17,
  titleFontSize: 11,
};

export function buildAntdThemeConfig(isDark: boolean, isUltra: boolean): ThemeConfig {
  if (!isDark) {
    return {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#6d28d9',
        colorInfo: '#0891b2',
        colorSuccess: '#16a34a',
        colorWarning: '#d97706',
        colorError: '#e11d48',
        colorBgLayout: '#eef2ff',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBorderSecondary: 'rgba(99, 102, 241, 0.14)',
        borderRadius: 12,
      },
      components: {
        Layout: {
          bodyBg: '#eef2ff',
          siderBg: '#ffffff',
          triggerBg: '#f8fafc',
        },
        Statistic: STATISTIC_TOKENS,
      },
    };
  }
  return {
    algorithm: antdTheme.darkAlgorithm,
    token: {
      borderRadius: 12,
      ...(isUltra ? ULTRA_DARK_TOKENS : DARK_TOKENS),
    },
    components: {
      Layout: isUltra ? ULTRA_DARK_LAYOUT_TOKENS : DARK_LAYOUT_TOKENS,
      Menu: isUltra ? ULTRA_DARK_MENU_TOKENS : DARK_MENU_TOKENS,
      Card: isUltra ? ULTRA_DARK_CARD_TOKENS : DARK_CARD_TOKENS,
      Statistic: STATISTIC_TOKENS,
    },
  };
}

export function pauseAnimationsUntilLeave(elementId: string): void {
  document.documentElement.setAttribute('data-theme-animations', 'off');
  const el = document.getElementById(elementId);
  if (!el) return;
  const restore = () => {
    document.documentElement.removeAttribute('data-theme-animations');
    el.removeEventListener('mouseleave', restore);
    el.removeEventListener('touchend', restore);
  };
  el.addEventListener('mouseleave', restore);
  el.addEventListener('touchend', restore);
}

interface ThemeContextValue {
  isDark: boolean;
  isUltra: boolean;
  toggleTheme: () => void;
  toggleUltra: () => void;
  antdThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(initialDark);
  const [isUltra, setIsUltra] = useState<boolean>(initialUltra);

  useEffect(() => {
    applyDom(isDark, isUltra);
    localStorage.setItem(STORAGE_DARK, String(isDark));
    localStorage.setItem(STORAGE_ULTRA, String(isUltra));
  }, [isDark, isUltra]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);
  const toggleUltra = useCallback(() => setIsUltra((v) => !v), []);

  const antdThemeConfig = useMemo(() => buildAntdThemeConfig(isDark, isUltra), [isDark, isUltra]);

  const value = useMemo<ThemeContextValue>(
    () => ({ isDark, isUltra, toggleTheme, toggleUltra, antdThemeConfig }),
    [isDark, isUltra, toggleTheme, toggleUltra, antdThemeConfig],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
