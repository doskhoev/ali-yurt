import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PLACE_COVER_BUCKET } from "@/lib/storage";
import { EditButton } from "@/components/EditButton";
import { DeleteButton } from "@/components/DeleteButton";
import { AddButton } from "@/components/AddButton";
import { deletePlace } from "./actions";

type PlaceRow = {
  id: string;
  slug: string;
  title: string;
  image_paths: string[];
  published_at: string | null;
  updated_at: string;
};

function formatDateTimeRu(iso: string) {
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

export default async function AdminPlacesIndexPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("places")
    .select("id, slug, title, image_paths, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  const items = ((rows ?? []) as PlaceRow[]).filter(Boolean);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Админка · Места</h1>
          <p className="text-sm text-muted-foreground">
            Здесь видны и черновики, и опубликованные.
          </p>
          {error && (
            <p className="text-sm text-red-600">Ошибка: {error.message}</p>
          )}
        </div>

        <AddButton href="/admin/places/new">Место</AddButton>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет мест.</p>
      ) : (
        <ul className="space-y-3">
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
                className={`rounded-xl border p-4 ${
                  !p.published_at ? "bg-muted/50 border-border opacity-75" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {firstImageUrl && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={firstImageUrl}
                        alt={p.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {p.published_at ? (
                      <Link
                        href={`/places/${p.slug}`}
                        className="font-medium hover:text-foreground block"
                      >
                        {p.title}
                      </Link>
                    ) : (
                      <div className="font-medium">{p.title}</div>
                    )}
                    {!p.published_at && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                        Черновик
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    slug: <span className="font-mono">{p.slug}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    обновлено: {formatDateTimeRu(p.updated_at)}
                    {p.published_at && (
                      <> · опубликовано: {formatDateTimeRu(p.published_at)}</>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <EditButton href={`/admin/places/${p.id}`} />
                  <form action={deletePlace.bind(null, p.id)} id={`delete-place-list-${p.id}`}>
                  </form>
                  <DeleteButton
                    formId={`delete-place-list-${p.id}`}
                    description="Место будет удалено безвозвратно."
                  />
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}


