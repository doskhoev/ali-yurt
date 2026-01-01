import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { Providers } from "@/components/providers";

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
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Али-Юрт",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('ali-yurt-theme') || 'system';
                const accent = localStorage.getItem('ali-yurt-accent') || 'default';
                const root = document.documentElement;
                
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
            <SiteHeader />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
