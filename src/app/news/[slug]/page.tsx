import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/Markdown";
import { createNewsComment } from "./actions";

export const dynamic = "force-dynamic";

type NewsRow = {
  id: string;
  slug: string;
  title: string;
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

export default async function NewsSlugPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  if (!slug) notFound();
  const supabase = await createSupabaseServerClient();

  const { data: news, error: newsError } = await supabase
    .from("news")
    .select("id, slug, title, excerpt, content, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (newsError || !news) notFound();

  const article = news as NewsRow;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, author_id, body, created_at")
    .eq("entity_type", "news")
    .eq("entity_id", article.id)
    .order("created_at", { ascending: false })
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
          <h1 className="text-3xl font-semibold tracking-tight">
            {article.title}
          </h1>
          {article.published_at && (
            <div className="text-sm text-zinc-600">
              {formatDateTimeRu(article.published_at)}
            </div>
          )}
          {article.excerpt && (
            <p className="text-zinc-700">{article.excerpt}</p>
          )}
        </header>

        <Markdown value={article.content} />
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Комментарии</h2>

        {commentsError && (
          <p className="text-sm text-red-600">
            Ошибка загрузки комментариев: {commentsError.message}
          </p>
        )}

        {!user ? (
          <p className="text-sm text-zinc-600">
            Чтобы оставить комментарий, войдите в аккаунт.
          </p>
        ) : (
          <form action={createNewsComment} className="space-y-3">
            <input type="hidden" name="entity_id" value={article.id} />
            <label className="block space-y-1">
              <span className="text-sm text-zinc-700">Ваш комментарий</span>
              <textarea
                name="body"
                required
                rows={3}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Напишите комментарий…"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-white"
            >
              Отправить
            </button>
          </form>
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
      </section>
    </main>
  );
}


