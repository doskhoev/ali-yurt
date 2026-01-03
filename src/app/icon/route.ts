import { NextRequest, NextResponse } from "next/server";

type Accent = "default" | "blue" | "green" | "purple" | "orange" | "red" | "pink" | "yellow" | "lightBlue";
type Theme = "light" | "dark" | "system";

const ACCENT_HEX: Record<Exclude<Accent, "default">, { light: string; dark: string }> = {
  blue: { light: "#3b82f6", dark: "#60a5fa" },
  green: { light: "#22c55e", dark: "#4ade80" },
  purple: { light: "#a855f7", dark: "#c084fc" },
  orange: { light: "#f97316", dark: "#fb923c" },
  red: { light: "#ef4444", dark: "#f87171" },
  pink: { light: "#ec4899", dark: "#f472b6" },
  yellow: { light: "#eab308", dark: "#facc15" },
  lightBlue: { light: "#38bdf8", dark: "#60a5fa" },
};

function isValidAccent(value: string | undefined): value is Accent {
  return (
    value === "default" ||
    value === "blue" ||
    value === "green" ||
    value === "purple" ||
    value === "orange" ||
    value === "red" ||
    value === "pink" ||
    value === "yellow" ||
    value === "lightBlue"
  );
}

function isValidTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

// Быстрый контраст: выбираем белый/черный для башни по яркости фона
function getContrastingFg(bgHex: string): "#000000" | "#ffffff" {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return "#ffffff";
  // perceived luminance (0..255)
  const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return lum > 160 ? "#000000" : "#ffffff";
}

export async function GET(request: NextRequest) {
  const accentCookieRaw = request.cookies.get("ali-yurt-accent")?.value;
  const themeCookieRaw = request.cookies.get("ali-yurt-theme")?.value;
  const resolvedThemeRaw = request.cookies.get("ali-yurt-theme-resolved")?.value;

  const accent: Accent = isValidAccent(accentCookieRaw) ? accentCookieRaw : "green";
  const themePref: Theme = isValidTheme(themeCookieRaw) ? themeCookieRaw : "dark";
  const resolvedTheme: Exclude<Theme, "system"> =
    resolvedThemeRaw === "light" || resolvedThemeRaw === "dark" ? resolvedThemeRaw : "dark";

  const effectiveTheme: Exclude<Theme, "system"> =
    themePref === "system" ? resolvedTheme : themePref;

  // "default" в UI: черный на светлой теме, белый на темной
  const bgColor =
    accent === "default"
      ? effectiveTheme === "dark"
        ? "#ffffff"
        : "#000000"
      : effectiveTheme === "dark"
        ? ACCENT_HEX[accent].dark
        : ACCENT_HEX[accent].light;

  const fgColor = getContrastingFg(bgColor);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="${bgColor}" />
  <path d="M35 80 V35 L42 25 H58 L65 35 V80 H35Z" fill="${fgColor}" />
  <rect x="45" y="45" width="10" height="15" rx="5" fill="${bgColor}" />
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // favicon должен мгновенно обновляться при смене темы/акцента
      "Cache-Control": "no-store, max-age=0",
    },
  });
}


