import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import { createPlaceComment } from "./actions";
import { PLACE_COVER_BUCKET } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

type PlaceRow = {
  id: string;
  slug: string;
  title: string;
  category_id: string | null;
  cover_image_path: string | null;
  excerpt: string | null;
  content: string;
  published_at: string | null;
};

type CommentRow = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

function formatDateTimeRu(iso: string) {
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

async function getPlaceBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("places")
    .select("id, slug, title, category_id, cover_image_path, excerpt, content, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as PlaceRow;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  if (!slug) return {};

  const place = await getPlaceBySlug(slug);
  if (!place) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/places/${place.slug}`;

  const description =
    place.excerpt ||
    place.content.slice(0, 160).replace(/[#*`]/g, "").trim() ||
    "Интересное место в селе Али-Юрт";

  const supabase = await createSupabaseServerClient();
  const coverUrl = place.cover_image_path
    ? supabase.storage
        .from(PLACE_COVER_BUCKET)
        .getPublicUrl(place.cover_image_path).data.publicUrl
    : null;

  return {
    title: place.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: place.title,
      description,
      url,
      type: "article",
      publishedTime: place.published_at || undefined,
      images: coverUrl ? [{ url: coverUrl, alt: place.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: place.title,
      description,
      images: coverUrl ? [coverUrl] : undefined,
    },
  };
}

export default async function PlaceSlugPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  if (!slug) notFound();

  const item = await getPlaceBySlug(slug);
  if (!item) notFound();

  const supabase = await createSupabaseServerClient();

  const coverUrl = item.cover_image_path
    ? supabase.storage
        .from(PLACE_COVER_BUCKET)
        .getPublicUrl(item.cover_image_path).data.publicUrl
    : null;

  const { data: category } = item.category_id
    ? await supabase
        .from("place_categories")
        .select("id, title")
        .eq("id", item.category_id)
        .maybeSingle()
    : { data: null as null | { id: string; title: string } };

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, author_id, body, created_at")
    .eq("entity_type", "place")
    .eq("entity_id", item.id)
    .order("created_at", { ascending: true })
    .limit(100);

  const comments = ((commentsData ?? []) as CommentRow[]).filter(Boolean);

  const authorIds = Array.from(new Set(comments.map((c) => c.author_id)));
  const { data: profilesData } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", authorIds)
    : { data: [] as ProfileRow[] };

  const profileById = new Map<string, ProfileRow>();
  (profilesData ?? []).forEach((p: ProfileRow) => profileById.set(p.id, p));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <article className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
          {item.published_at && (
            <div className="text-sm text-zinc-600">
              {formatDateTimeRu(item.published_at)}
            </div>
          )}
          {category?.title && (
            <div className="text-sm text-zinc-600">Категория: {category.title}</div>
          )}
        </header>

        {coverUrl && (
          <div className="flex justify-center">
            <Image
              src={coverUrl}
              alt={item.title}
              width={800}
              height={400}
              className="max-w-full max-h-[400px] w-auto h-auto object-contain rounded-xl border"
              style={{ height: "auto" }}
            />
          </div>
        )}

        <Markdown value={item.content} />
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Комментарии</h2>

        {commentsError && (
          <p className="text-sm text-red-600">
            Ошибка загрузки комментариев: {commentsError.message}
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-zinc-600">Пока нет комментариев.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => {
              const profile = profileById.get(c.author_id);
              const authorLabel = profile?.display_name?.trim()
                ? profile.display_name
                : "Пользователь";

              return (
                <li key={c.id} className="rounded-xl border p-4 space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-sm font-medium">{authorLabel}</div>
                    <div className="text-xs text-zinc-500">
                      {formatDateTimeRu(c.created_at)}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-800 whitespace-pre-wrap">
                    {c.body}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!user ? (
          <p className="text-sm text-zinc-600">
            Чтобы оставить комментарий, войдите в аккаунт.
          </p>
        ) : (
                <form action={createPlaceComment} className="space-y-3">
                  <input type="hidden" name="entity_id" value={item.id} />
                  <div className="space-y-2">
                    <Label htmlFor="body">Ваш комментарий</Label>
                    <Textarea
                      id="body"
                      name="body"
                      required
                      rows={3}
                      placeholder="Напишите комментарий…"
                    />
                  </div>
                  <Button type="submit">Отправить</Button>
                </form>
        )}
      </section>
    </main>
  );
}


