import { NextResponse } from "next/server";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login
Disallow: /auth/

Sitemap: ${sitemapUrl}
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

