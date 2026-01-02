import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import { HeaderHider } from "@/components/HeaderHider";
import { Providers } from "@/components/providers";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Али-Юрт",
    template: "%s | Али-Юрт",
  },
  description: "Справочник жителя: новости, места и объявления.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Али-Юрт",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const showHeader = pathname !== "/setup-username";

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('ali-yurt-theme') || 'dark';
                const accent = localStorage.getItem('ali-yurt-accent') || 'green';
                const root = document.documentElement;
                
                // Синхронизируем с cookies для использования в route handlers
                document.cookie = 'ali-yurt-theme=' + theme + '; path=/; max-age=31536000';
                document.cookie = 'ali-yurt-accent=' + accent + '; path=/; max-age=31536000';
                
                if (accent !== 'default') {
                  root.setAttribute('data-accent', accent);
                }
                
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  if (systemTheme === 'dark') {
                    root.classList.add('dark');
                  }
                } else if (theme === 'dark') {
                  root.classList.add('dark');
                }
                
                // Обновляем favicon сразу при загрузке страницы
                const accentColors = {
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
                
                const isDark = theme === 'dark' || 
                  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                
                const color = accentColors[accent] || accentColors.green;
                const fillColor = isDark ? color.dark : color.light;
                
                const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="' + fillColor + '" /><path d="M35 80 V35 L42 25 H58 L65 35 V80 H35Z" fill="white" /><rect x="45" y="45" width="10" height="15" rx="5" fill="' + fillColor + '" /></svg>';
                
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                
                let link = document.querySelector('link[rel="icon"]');
                if (!link) {
                  link = document.createElement('link');
                  link.rel = 'icon';
                  document.head.appendChild(link);
                }
                link.href = url;
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-dvh bg-background text-foreground">
            <Suspense fallback={null}>
              <ConditionalHeader />
            </Suspense>
            <HeaderHider />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
