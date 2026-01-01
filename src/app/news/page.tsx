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
  image_paths: string[];
  excerpt: string | null;
  published_at: string | null;
};

export default async function NewsIndexPage() {
  const supabase = await createSupabaseServerClient();
  const isAdmin = await getIsAdmin();

  const query = supabase
    .from("news")
    .select("id, slug, title, image_paths, excerpt, published_at")
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
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "Админ видит все, включая черновики." : "Показаны только опубликованные."}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет опубликованных новостей.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((n) => {
            const imagePaths = Array.isArray(n.image_paths) ? n.image_paths : [];
            const firstImageUrl = imagePaths.length > 0
              ? supabase.storage
                  .from(NEWS_COVER_BUCKET)
                  .getPublicUrl(imagePaths[0]).data.publicUrl
              : null;

            return (
              <li
                key={n.id}
                className={`rounded-xl border overflow-hidden ${
                  !n.published_at ? "bg-muted/50 border-border opacity-75" : ""
                }`}
              >
                <Link href={`/news/${n.slug}`} className="block">
                  <div className="flex gap-4">
                    {firstImageUrl && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={firstImageUrl}
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
                          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                            Черновик
                          </span>
                        )}
                      </div>
                      {n.excerpt && (
                        <div className="text-sm text-muted-foreground">{n.excerpt}</div>
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


