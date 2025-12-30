import { createNews } from "../actions";

type SearchParams = Record<string, string | string[] | undefined>;

export default function AdminNewsNewPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const errorParam = searchParams?.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Новая новость</h1>
        <p className="text-sm text-zinc-600">Контент в Markdown.</p>
        {error && (
          <p className="text-sm text-red-600">Ошибка: {decodeURIComponent(error)}</p>
        )}
      </header>

      <form action={createNews} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm">Заголовок</span>
          <input
            name="title"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm">
            Slug (опционально, иначе будет из заголовка)
          </span>
          <input name="slug" className="w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block space-y-1">
          <span className="text-sm">Короткое описание (excerpt)</span>
          <textarea
            name="excerpt"
            rows={2}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm">Контент (Markdown)</span>
          <textarea
            name="content"
            required
            rows={14}
            className="w-full rounded-md border px-3 py-2 font-mono text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish" value="1" />
          Опубликовать сразу
        </label>

        <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
          Создать
        </button>
      </form>
    </main>
  );
}


