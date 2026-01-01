import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Админка</h1>
        <p className="text-sm text-zinc-600">Управление контентом.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/news"
          className="rounded-xl border p-5 hover:bg-zinc-50 transition-colors"
        >
          <div className="font-medium">Новости</div>
          <div className="text-sm text-zinc-600">Создание и публикация</div>
        </Link>

        <Link
          href="/admin/places"
          className="rounded-xl border p-5 hover:bg-zinc-50 transition-colors"
        >
          <div className="font-medium">Места</div>
          <div className="text-sm text-zinc-600">Создание и публикация</div>
        </Link>

        <Link
          href="/admin/place-categories"
          className="rounded-xl border p-5 hover:bg-zinc-50 transition-colors"
        >
          <div className="font-medium">Категории мест</div>
          <div className="text-sm text-zinc-600">Справочник</div>
        </Link>
      </section>
    </main>
  );
}


