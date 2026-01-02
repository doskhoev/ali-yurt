import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import { createNewsComment, deleteComment } from "./actions";
import { NEWS_COVER_BUCKET } from "@/lib/storage";
import { SubmitButton } from "@/components/SubmitButton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getIsAdmin } from "@/lib/auth/admin";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

type NewsRow = {
  id: string;
  slug: string;
  title: string;
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
  username: string | null;
};

function formatDateTimeRu(iso: string) {
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

async function getNewsBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("news")
    .select("id, slug, title, image_paths, excerpt, content, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as NewsRow;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  if (!slug) return {};

  const article = await getNewsBySlug(slug);
  if (!article) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/news/${article.slug}`;

  const description =
    article.excerpt ||
    article.content.slice(0, 160).replace(/[#*`]/g, "").trim() ||
    "Новость из справочника жителя Али-Юрт";

  const firstImageUrl = article.image_paths && article.image_paths.length > 0
    ? (await createSupabaseServerClient()).storage
        .from(NEWS_COVER_BUCKET)
        .getPublicUrl(article.image_paths[0]).data.publicUrl
    : null;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description,
      url,
      type: "article",
      publishedTime: article.published_at || undefined,
      images: firstImageUrl ? [{ url: firstImageUrl, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: firstImageUrl ? [firstImageUrl] : undefined,
    },
  };
}

export default async function NewsSlugPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  if (!slug) notFound();

  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  const isAdmin = user ? await getIsAdmin() : false;

  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, author_id, body, created_at")
    .eq("entity_type", "news")
    .eq("entity_id", article.id)
    .order("created_at", { ascending: true })
    .limit(100);

  const comments = ((commentsData ?? []) as CommentRow[]).filter(Boolean);

  const authorIds = Array.from(new Set(comments.map((c) => c.author_id)));
  const { data: profilesData } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", authorIds)
    : { data: [] as ProfileRow[] };

  const profileById = new Map<string, ProfileRow>();
  (profilesData ?? []).forEach((p: ProfileRow) => profileById.set(p.id, p));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
      <article className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {article.title}
          </h1>
          {article.published_at && (
            <div className="text-sm text-muted-foreground">
              {formatDateTimeRu(article.published_at)}
            </div>
          )}
        </header>

        {(() => {
          const imagePaths = Array.isArray(article.image_paths) ? article.image_paths : [];
          const imageUrls = imagePaths.map((imagePath) =>
            supabase.storage
              .from(NEWS_COVER_BUCKET)
              .getPublicUrl(imagePath).data.publicUrl
          );

          return (
            <Markdown
              value={article.content}
              imageUrls={imageUrls}
              imageAlt={article.title}
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
              const authorLabel = profile?.username?.trim()
                ? profile.username
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
                <form action={createNewsComment} className="space-y-3">
                  <input type="hidden" name="entity_id" value={article.id} />
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
                  <SubmitButton>Отправить</SubmitButton>
                </form>
        )}
      </section>
    </main>
  );
}


