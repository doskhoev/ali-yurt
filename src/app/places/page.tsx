import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PLACE_COVER_BUCKET } from "@/lib/storage";
import { getIsAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Места",
  description: "Интересные места села Али-Юрт: достопримечательности и полезные локации.",
  openGraph: {
    title: "Места | Али-Юрт",
    description: "Интересные места села Али-Юрт: достопримечательности и полезные локации.",
  },
};

type PlaceRow = {
  id: string;
  slug: string;
  title: string;
  category_id: string | null;
  cover_image_path: string | null;
  excerpt: string | null;
  published_at: string | null;
};

export default async function PlacesIndexPage() {
  const supabase = await createSupabaseServerClient();
  const isAdmin = await getIsAdmin();

  const query = supabase
    .from("places")
    .select("id, slug, title, category_id, cover_image_path, excerpt, published_at")
    .order("published_at", { ascending: false })
    .limit(30);

  // Если не админ, показываем только опубликованные
  if (!isAdmin) {
    query.not("published_at", "is", null);
  }

  const { data: places, error } = await query;

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Места</h1>
        <p className="text-sm text-red-600">
          Ошибка загрузки: {error.message}
        </p>
      </main>
    );
  }

  const items = (places ?? []) as PlaceRow[];
  const categoryIds = Array.from(
    new Set(items.map((p) => p.category_id).filter(Boolean))
  ) as string[];

  const { data: categories } = categoryIds.length
    ? await supabase
        .from("place_categories")
        .select("id, title")
        .in("id", categoryIds)
    : { data: [] as { id: string; title: string }[] };

  const catTitleById = new Map<string, string>();
  (categories ?? []).forEach((c) => catTitleById.set(c.id, c.title));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Места</h1>
        <p className="text-sm text-zinc-600">
          {isAdmin ? "Админ видит все, включая черновики." : "Показаны только опубликованные."}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Пока нет опубликованных мест.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((p) => {
            const coverUrl = p.cover_image_path
              ? supabase.storage
                  .from(PLACE_COVER_BUCKET)
                  .getPublicUrl(p.cover_image_path).data.publicUrl
              : null;

            return (
              <li
                key={p.id}
                className={`rounded-xl border overflow-hidden ${
                  !p.published_at ? "bg-zinc-50 border-zinc-200 opacity-75" : ""
                }`}
              >
                <Link href={`/places/${p.slug}`} className="block">
                  <div className="flex gap-4">
                    {coverUrl && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={coverUrl}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">{p.title}</div>
                        {!p.published_at && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Черновик
                          </span>
                        )}
                      </div>
                      {p.category_id && catTitleById.get(p.category_id) && (
                        <div className="text-xs text-zinc-500">
                          {catTitleById.get(p.category_id)}
                        </div>
                      )}
                      {p.excerpt && (
                        <div className="text-sm text-zinc-600">{p.excerpt}</div>
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


