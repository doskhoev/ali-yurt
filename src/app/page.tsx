import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Главная",
  description:
    "Справочник жителя села Али-Юрт: новости, интересные места и объявления.",
};

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Али-Юрт</h1>
        <p className="text-muted-foreground">
          Черновой каркас: новости и интересные места. Комментарии доступны
          зарегистрированным.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/news"
          className="rounded-xl border p-5 hover:bg-muted transition-colors"
        >
          <div className="font-medium">Новости</div>
          <div className="text-sm text-muted-foreground">Список и страницы новостей</div>
        </Link>

        <Link
          href="/places"
          className="rounded-xl border p-5 hover:bg-muted transition-colors"
        >
          <div className="font-medium">Места</div>
          <div className="text-sm text-muted-foreground">
            Интересные места и описание
          </div>
        </Link>
      </section>
    </main>
  );
}
