"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type AccentColor = "default" | "blue" | "green" | "purple" | "orange" | "red" | "pink" | "yellow" | "lightBlue";

const THEME_STORAGE_KEY = "ali-yurt-theme";
const ACCENT_STORAGE_KEY = "ali-yurt-accent";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000`;
}

function refreshFavicon() {
  const href = `/icon?t=${Date.now()}`;

  // В App Router Next может держать несколько иконок (icon / shortcut icon).
  // Обновляем все существующие, чтобы браузер точно взял актуальную.
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"]'
    )
  );

  if (links.length === 0) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/svg+xml";
    icon.href = href;
    document.head.appendChild(icon);

    const shortcut = document.createElement("link");
    shortcut.rel = "shortcut icon";
    shortcut.type = "image/svg+xml";
    shortcut.href = href;
    document.head.appendChild(shortcut);
    return;
  }

  for (const link of links) {
    link.type = "image/svg+xml";
    link.href = href;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [accentColor, setAccentColor] = React.useState<AccentColor>("green");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;

    const initialTheme = savedTheme ?? "dark";
    const initialAccent = savedAccent ?? "green";

    setTheme(initialTheme);
    setAccentColor(initialAccent);

    // Синхронизируем с cookies для route handler /icon
    setCookie(THEME_STORAGE_KEY, initialTheme);
    setCookie(ACCENT_STORAGE_KEY, initialAccent);
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystem = (isDark: boolean) => {
        root.classList.toggle("dark", isDark);
        setCookie("ali-yurt-theme-resolved", isDark ? "dark" : "light");
        refreshFavicon();
      };

      applySystem(mediaQuery.matches);

      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        applySystem(e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      root.classList.toggle("dark", theme === "dark");
      setCookie("ali-yurt-theme-resolved", theme === "dark" ? "dark" : "light");
    }

    // Apply accent color
    root.setAttribute("data-accent", accentColor);

    // Синхронизируем cookies для /icon и обновляем favicon
    setCookie(THEME_STORAGE_KEY, theme);
    setCookie(ACCENT_STORAGE_KEY, accentColor);
    refreshFavicon();
  }, [theme, accentColor, mounted]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setCookie(THEME_STORAGE_KEY, newTheme);
    refreshFavicon();
  };

  const updateAccentColor = (newAccent: AccentColor) => {
    setAccentColor(newAccent);
    localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
    setCookie(ACCENT_STORAGE_KEY, newAccent);
    refreshFavicon();
  };

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

