"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type AccentColor = "default" | "blue" | "green" | "purple" | "orange" | "red" | "pink";

const THEME_STORAGE_KEY = "ali-yurt-theme";
const ACCENT_STORAGE_KEY = "ali-yurt-accent";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>("system");
  const [accentColor, setAccentColor] = React.useState<AccentColor>("default");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;

    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedAccent) {
      setAccentColor(savedAccent);
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
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }

    // Apply accent color
    root.setAttribute("data-accent", accentColor);
  }, [theme, accentColor, mounted]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const updateAccentColor = (newAccent: AccentColor) => {
    setAccentColor(newAccent);
    localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
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
  theme: "system",
  accentColor: "default",
  updateTheme: () => {},
  updateAccentColor: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

