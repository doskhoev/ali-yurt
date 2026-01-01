import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О селе | Али-Юрт",
  description: "Информация о селе Али-Юрт",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">О селе</h1>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p>
          Добро пожаловать на сайт села Али-Юрт!
        </p>
        <p>
          Здесь вы найдете актуальные новости, информацию об интересных местах и возможность оставить комментарий.
        </p>
      </div>
    </main>
  );
}

