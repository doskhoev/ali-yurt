import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createPlaceCategory,
  deletePlaceCategory,
} from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";

type SearchParams = Record<string, string | string[] | undefined>;

type CategoryRow = {
  id: string;
  slug: string;
  title: string;
  icon_name: string | null;
  created_at: string;
};

function formatDateTimeRu(iso: string) {
  const dt = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

export default async function AdminPlaceCategoriesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const errorParam = searchParams?.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  const supabase = await createSupabaseServerClient();
  const { data: rows, error: loadError } = await supabase
    .from("place_categories")
    .select("id, slug, title, icon_name, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const items = ((rows ?? []) as CategoryRow[]).filter(Boolean);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Админка · Категории мест</h1>
        <p className="text-sm text-zinc-600">
          Эти категории используются при создании/редактировании места.
        </p>
        {(error || loadError) && (
          <p className="text-sm text-red-600">
            Ошибка: {decodeURIComponent(error ?? loadError?.message ?? "")}
          </p>
        )}
      </header>

      <section className="rounded-xl border p-5 space-y-4">
        <h2 className="font-medium">Создать категорию</h2>

        <form action={createPlaceCategory} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">
              Название <span className="text-red-600">*</span>
            </Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="icon_name">Иконка (icon_name)</Label>
            <Input
              id="icon_name"
              name="icon_name"
              placeholder="Например: map-pin"
            />
            <p className="text-xs text-zinc-600">
              Пока это просто строка. Позже можно связать с Lucide (или другой
              библиотекой).
            </p>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Список</h2>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-600">Категорий пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => (
              <li key={c.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-zinc-600">
                      slug: <span className="font-mono">{c.slug}</span>
                    </div>
                    {c.icon_name && (
                      <div className="text-xs text-zinc-600">
                        icon: <span className="font-mono">{c.icon_name}</span>
                      </div>
                    )}
                    <div className="text-xs text-zinc-600">
                      создано: {formatDateTimeRu(c.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/place-categories/${c.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Редактировать</p>
                      </TooltipContent>
                    </Tooltip>

                    <form action={deletePlaceCategory.bind(null, c.id)} id={`delete-category-list-${c.id}`}>
                    </form>
                    <DeleteButton
                      formId={`delete-category-list-${c.id}`}
                      description="Категория будет удалена безвозвратно."
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}


