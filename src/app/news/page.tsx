import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

export default async function NewsIndexPage() {
  const supabase = await createSupabaseServerClient();

  const { data: news, error } = await supabase
    .from("news")
    .select("id, slug, title, excerpt, published_at")
    .order("published_at", { ascending: false })
    .limit(30);

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
        <p className="text-sm text-zinc-600">Показаны только опубликованные.</p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Пока нет опубликованных новостей.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((n) => (
            <li key={n.id} className="rounded-xl border p-5">
              <Link href={`/news/${n.slug}`} className="block space-y-1">
                <div className="text-lg font-medium">{n.title}</div>
                {n.excerpt && (
                  <div className="text-sm text-zinc-600">{n.excerpt}</div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


