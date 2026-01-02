import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PLACE_COVER_BUCKET } from "@/lib/storage";
import { getIsAdmin } from "@/lib/auth/admin";
import { CategoryIcon } from "@/components/CategoryIcon";

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
  image_paths: string[];
  excerpt: string | null;
  published_at: string | null;
};

export default async function PlacesIndexPage() {
  const supabase = await createSupabaseServerClient();
  
  // Проверяем, нужно ли редиректить на установку username
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    // Если профиля нет или username не установлен, редиректим
    const hasUsername = profile?.username && profile.username.trim().length > 0;
    if (!hasUsername) {
      redirect("/setup-username");
    }
  }
  
  const isAdmin = await getIsAdmin();

  const query = supabase
    .from("places")
    .select("id, slug, title, category_id, image_paths, excerpt, published_at")
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
        .select("id, title, icon_svg")
        .in("id", categoryIds)
    : { data: [] as { id: string; title: string; icon_svg: string | null }[] };

  const catTitleById = new Map<string, string>();
  const catIconById = new Map<string, string | null>();
  (categories ?? []).forEach((c) => {
    catTitleById.set(c.id, c.title);
    catIconById.set(c.id, c.icon_svg);
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Места</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "Админ видит все, включая черновики." : "Показаны только опубликованные."}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет опубликованных мест.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((p) => {
            const imagePaths = Array.isArray(p.image_paths) ? p.image_paths : [];
            const firstImageUrl = imagePaths.length > 0
              ? supabase.storage
                  .from(PLACE_COVER_BUCKET)
                  .getPublicUrl(imagePaths[0]).data.publicUrl
              : null;

            return (
              <li
                key={p.id}
                className={`rounded-xl border overflow-hidden ${
                  !p.published_at ? "bg-muted/50 border-border opacity-75" : ""
                }`}
              >
                <Link href={`/places/${p.slug}`} className="block">
                  <div className="flex gap-4">
                    {firstImageUrl && (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={firstImageUrl}
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
                          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                            Черновик
                          </span>
                        )}
                      </div>
                      {p.category_id && catTitleById.get(p.category_id) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {catIconById.get(p.category_id) && (
                            <CategoryIcon 
                              svgCode={catIconById.get(p.category_id)!} 
                              className="w-4 h-4 text-primary"
                            />
                          )}
                          <span>{catTitleById.get(p.category_id)}</span>
                        </div>
                      )}
                      {p.excerpt && (
                        <div className="text-sm text-muted-foreground">{p.excerpt}</div>
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


