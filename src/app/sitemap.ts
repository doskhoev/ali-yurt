import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createSupabaseServerClient();

  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/places`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Get published news
  const { data: news } = await supabase
    .from("news")
    .select("slug, updated_at, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(1000);

  const newsUrls: MetadataRoute.Sitemap =
    news?.map((n) => ({
      url: `${siteUrl}/news/${n.slug}`,
      lastModified: n.updated_at
        ? new Date(n.updated_at)
        : n.published_at
          ? new Date(n.published_at)
          : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) || [];

  // Get published places
  const { data: places } = await supabase
    .from("places")
    .select("slug, updated_at, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(1000);

  const placesUrls: MetadataRoute.Sitemap =
    places?.map((p) => ({
      url: `${siteUrl}/places/${p.slug}`,
      lastModified: p.updated_at
        ? new Date(p.updated_at)
        : p.published_at
          ? new Date(p.published_at)
          : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })) || [];

  return [...baseUrls, ...newsUrls, ...placesUrls];
}

