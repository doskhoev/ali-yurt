"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type AccentColor = "default" | "blue" | "green" | "purple" | "orange" | "red" | "pink" | "yellow" | "lightBlue";

const THEME_STORAGE_KEY = "ali-yurt-theme";
const ACCENT_STORAGE_KEY = "ali-yurt-accent";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [accentColor, setAccentColor] = React.useState<AccentColor>("green");
  
  // Используем ref для хранения актуальных значений для немедленного обновления favicon
  const themeRef = React.useRef(theme);
  const accentColorRef = React.useRef(accentColor);
  
  React.useEffect(() => {
    themeRef.current = theme;
    accentColorRef.current = accentColor;
  }, [theme, accentColor]);

  const updateFavicon = React.useCallback((accent: AccentColor, currentTheme: Theme) => {
    const accentColors: Record<string, { light: string; dark: string }> = {
      default: { light: "#0f172a", dark: "#0f172a" },
      blue: { light: "#3b82f6", dark: "#60a5fa" },
      green: { light: "#22c55e", dark: "#4ade80" },
      purple: { light: "#a855f7", dark: "#c084fc" },
      orange: { light: "#f97316", dark: "#fb923c" },
      red: { light: "#ef4444", dark: "#f87171" },
      pink: { light: "#ec4899", dark: "#f472b6" },
      yellow: { light: "#eab308", dark: "#facc15" },
      lightBlue: { light: "#38bdf8", dark: "#60a5fa" },
    };
    
    const isDark = currentTheme === "dark" || 
      (currentTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    const color = accentColors[accent] || accentColors.green;
    const fillColor = isDark ? color.dark : color.light;
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="${fillColor}" />
  <path d="M35 80 V35 L42 25 H58 L65 35 V80 H35Z" fill="white" />
  <rect x="45" y="45" width="10" height="15" rx="5" fill="${fillColor}" />
</svg>`;
    
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    
    // Удаляем все существующие favicon ссылки
    const existingLinks = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
    existingLinks.forEach(link => {
      try {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      } catch (e) {
        // Игнорируем ошибки, если элемент уже удален
      }
    });
    
    // Создаем новую ссылку на favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = url;
    document.head.appendChild(link);
    
    // Очищаем старый URL через некоторое время
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;

    if (savedTheme) {
      setTheme(savedTheme);
      // Синхронизируем с cookies
      document.cookie = `${THEME_STORAGE_KEY}=${savedTheme}; path=/; max-age=31536000`;
    }
    if (savedAccent) {
      setAccentColor(savedAccent);
      // Синхронизируем с cookies
      document.cookie = `${ACCENT_STORAGE_KEY}=${savedAccent}; path=/; max-age=31536000`;
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.toggle("dark", systemTheme === "dark");

      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
        // Обновляем favicon при изменении системной темы
        updateFavicon(accentColor, theme);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }

    // Apply accent color
    root.setAttribute("data-accent", accentColor);
    
    // Обновляем favicon при изменении акцента
    updateFavicon(accentColor, theme);
  }, [theme, accentColor, mounted, updateFavicon]);

  const updateTheme = React.useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    themeRef.current = newTheme;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    // Синхронизируем с cookies для использования в route handlers
    document.cookie = `${THEME_STORAGE_KEY}=${newTheme}; path=/; max-age=31536000`;
    // Обновляем favicon немедленно с актуальными значениями
    updateFavicon(accentColorRef.current, newTheme);
  }, [updateFavicon]);

  const updateAccentColor = React.useCallback((newAccent: AccentColor) => {
    setAccentColor(newAccent);
    accentColorRef.current = newAccent;
    localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
    // Синхронизируем с cookies для использования в route handlers
    document.cookie = `${ACCENT_STORAGE_KEY}=${newAccent}; path=/; max-age=31536000`;
    // Обновляем favicon немедленно с актуальными значениями
    updateFavicon(newAccent, themeRef.current);
  }, [updateFavicon]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, accentColor, updateTheme, updateAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

const ThemeContext = React.createContext<{
  theme: Theme;
  accentColor: AccentColor;
  updateTheme: (theme: Theme) => void;
  updateAccentColor: (accent: AccentColor) => void;
}>({
  theme: "dark",
  accentColor: "green",
  updateTheme: () => { },
  updateAccentColor: () => { },
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

