import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import { createPlaceComment, deleteComment } from "./actions";
import { PLACE_COVER_BUCKET } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getIsAdmin } from "@/lib/auth/admin";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

type PlaceRow = {
  id: string;
  slug: string;
  title: string;
  category_id: string | null;
  image_paths: string[];
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
    .select("id, slug, title, category_id, image_paths, excerpt, content, published_at")
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
  const firstImageUrl = place.image_paths && place.image_paths.length > 0
    ? supabase.storage
        .from(PLACE_COVER_BUCKET)
        .getPublicUrl(place.image_paths[0]).data.publicUrl
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
      images: firstImageUrl ? [{ url: firstImageUrl, alt: place.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: place.title,
      description,
      images: firstImageUrl ? [firstImageUrl] : undefined,
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

  const { data: category } = item.category_id
    ? await supabase
        .from("place_categories")
        .select("id, title, icon_svg")
        .eq("id", item.category_id)
        .maybeSingle()
    : { data: null as null | { id: string; title: string; icon_svg: string | null } };

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  const isAdmin = user ? await getIsAdmin() : false;

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
            <div className="text-sm text-muted-foreground">
              {formatDateTimeRu(item.published_at)}
            </div>
          )}
          {category?.title && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Категория:</span>
              {category.icon_svg && (
                <CategoryIcon 
                  svgCode={category.icon_svg} 
                  className="w-5 h-5 text-primary"
                />
              )}
              <span>{category.title}</span>
            </div>
          )}
        </header>

        {(() => {
          const imagePaths = Array.isArray(item.image_paths) ? item.image_paths : [];
          const imageUrls = imagePaths.map((imagePath) =>
            supabase.storage
              .from(PLACE_COVER_BUCKET)
              .getPublicUrl(imagePath).data.publicUrl
          );

          return (
            <Markdown
              value={item.content}
              imageUrls={imageUrls}
              imageAlt={item.title}
            />
          );
        })()}
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Комментарии</h2>

        {commentsError && (
          <p className="text-sm text-red-600">
            Ошибка загрузки комментариев: {commentsError.message}
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет комментариев.</p>
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
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {formatDateTimeRu(c.created_at)}
                      </div>
                      {(isAdmin || user?.id === c.author_id) && (
                        <>
                          <form id={`delete-comment-${c.id}`} action={deleteComment.bind(null, c.id)} className="hidden" />
                          <DeleteButton
                            formId={`delete-comment-${c.id}`}
                            title="Удалить комментарий"
                            description="Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить."
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    {c.body}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!user ? (
          <p className="text-sm text-muted-foreground">
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


