import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NEWS_COVER_BUCKET } from "@/lib/storage";
import { getIsAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Новости",
  description: "Актуальные новости села Али-Юрт.",
  openGraph: {
    title: "Новости | Али-Юрт",
    description: "Актуальные новости села Али-Юрт.",
  },
};

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  cover_image_path: string | null;
  excerpt: string | null;
  published_at: string | null;
};

export default async function NewsIndexPage() {
  const supabase = await createSupabaseServerClient();
  const isAdmin = await getIsAdmin();

  const query = supabase
    .from("news")
    .select("id, slug, title, cover_image_path, excerpt, published_at")
    .order("published_at", { ascending: false })
    .limit(30);

  // Если не админ, показываем только опубликованные
  if (!isAdmin) {
    query.not("published_at", "is", null);
  }

  const { data: news, error } = await query;

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Новости</h1>
        <p className="text-sm text-red-600">
          Ошибка загрузки: {error.message}
        </p>
      </main>
    );
  }

  const items = (news ?? []) as NewsRow[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Новости</h1>
        <p className="text-sm text-zinc-600">
          {isAdmin ? "Админ видит все, включая черновики." : "Показаны только опубликованные."}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Пока нет опубликованных новостей.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((n) => {
            const coverUrl = n.cover_image_path
              ? supabase.storage
                  .from(NEWS_COVER_BUCKET)
                  .getPublicUrl(n.cover_image_path).data.publicUrl
              : null;

            return (
              <li
                key={n.id}
                className={`rounded-xl border overflow-hidden ${
                  !n.published_at ? "bg-zinc-50 border-zinc-200 opacity-75" : ""
                }`}
              >
                <Link href={`/news/${n.slug}`} className="block">
                  <div className="flex gap-4">
                    {coverUrl && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={coverUrl}
                          alt={n.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">{n.title}</div>
                        {!n.published_at && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Черновик
                          </span>
                        )}
                      </div>
                      {n.excerpt && (
                        <div className="text-sm text-zinc-600">{n.excerpt}</div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}


