import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updatePlace } from "../actions";

type SearchParams = Record<string, string | string[] | undefined>;

type PlaceRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
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

export default async function AdminPlaceEditPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: SearchParams;
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    )
  ) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Некорректный ID</h1>
        <p className="text-sm text-zinc-600">Ожидался UUID.</p>
        <Link
          href="/admin/places"
          className="text-sm text-zinc-700 hover:text-black"
        >
          ← Назад
        </Link>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("places")
    .select("id, slug, title, excerpt, content, published_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !row) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Место не найдено</h1>
        <p className="text-sm text-red-600">{error?.message ?? "not found"}</p>
        <Link
          href="/admin/places"
          className="text-sm text-zinc-700 hover:text-black"
        >
          ← Назад
        </Link>
      </main>
    );
  }

  const item = row as PlaceRow;

  const errParam = searchParams?.error;
  const err = Array.isArray(errParam) ? errParam[0] : errParam;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Редактировать место</h1>
          <Link
            href="/admin/places"
            className="text-sm text-zinc-700 hover:text-black"
          >
            ← К списку
          </Link>
        </div>
        <p className="text-sm text-zinc-600">
          обновлено: {formatDateTimeRu(item.updated_at)} · статус:{" "}
          {item.published_at ? "опубликовано" : "черновик"}
        </p>
        {err && (
          <p className="text-sm text-red-600">Ошибка: {decodeURIComponent(err)}</p>
        )}
      </header>

      <form action={updatePlace.bind(null, item.id)} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm">Название</span>
          <input
            name="title"
            required
            defaultValue={item.title}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm">Slug</span>
          <input
            name="slug"
            defaultValue={item.slug}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm">Короткое описание (excerpt)</span>
          <textarea
            name="excerpt"
            defaultValue={item.excerpt ?? ""}
            rows={2}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm">Контент (Markdown)</span>
          <textarea
            name="content"
            required
            defaultValue={item.content}
            rows={14}
            className="w-full rounded-md border px-3 py-2 font-mono text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="publish"
            value="1"
            defaultChecked={Boolean(item.published_at)}
          />
          Опубликовано
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
            Сохранить
          </button>
          {item.published_at && (
            <Link
              href={`/places/${item.slug}`}
              className="text-sm text-zinc-700 hover:text-black"
            >
              Открыть на сайте →
            </Link>
          )}
        </div>
      </form>
    </main>
  );
}


