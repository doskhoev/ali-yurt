import Link from "next/link";
import { Pencil } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteNews } from "./actions";

type NewsRow = {
  id: string;
  slug: string;
  title: string;
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

export default async function AdminNewsIndexPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("news")
    .select("id, slug, title, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  const items = ((rows ?? []) as NewsRow[]).filter(Boolean);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Админка · Новости</h1>
          <p className="text-sm text-zinc-600">
            Здесь видны и черновики, и опубликованные.
          </p>
          {error && (
            <p className="text-sm text-red-600">Ошибка: {error.message}</p>
          )}
        </div>

        <Link
          href="/admin/news/new"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          + Новость
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Пока нет новостей.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${
                !n.published_at ? "bg-zinc-50 border-zinc-200 opacity-75" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {n.published_at ? (
                      <Link
                        href={`/news/${n.slug}`}
                        className="font-medium hover:text-zinc-600 block"
                      >
                        {n.title}
                      </Link>
                    ) : (
                      <div className="font-medium">{n.title}</div>
                    )}
                    {!n.published_at && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Черновик
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600">
                    slug: <span className="font-mono">{n.slug}</span>
                  </div>
                  <div className="text-xs text-zinc-600">
                    обновлено: {formatDateTimeRu(n.updated_at)}
                    {n.published_at && (
                      <> · опубликовано: {formatDateTimeRu(n.published_at)}</>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/news/${n.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Редактировать</p>
                    </TooltipContent>
                  </Tooltip>
                  <form action={deleteNews.bind(null, n.id)} id={`delete-news-list-${n.id}`}>
                  </form>
                  <DeleteButton
                    formId={`delete-news-list-${n.id}`}
                    description="Новость будет удалена безвозвратно."
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


