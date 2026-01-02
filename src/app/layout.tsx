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
