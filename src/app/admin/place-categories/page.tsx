import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createPlaceCategory,
  deletePlaceCategory,
} from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { CategoryIcon } from "@/components/CategoryIcon";

type SearchParams = Record<string, string | string[] | undefined>;

type CategoryRow = {
  id: string;
  slug: string;
  title: string;
  icon_svg: string | null;
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
    .select("id, slug, title, icon_svg, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const items = ((rows ?? []) as CategoryRow[]).filter(Boolean);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Админка · Категории мест</h1>
        <p className="text-sm text-muted-foreground">
          Эти категории используются при создании/редактировании места.
        </p>
        {(error || loadError) && (
          <p className="text-sm text-red-600">
            Ошибка: {decodeURIComponent(error ?? loadError?.message ?? "")}
          </p>
        )}
      </header>

      <section className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Категорий пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => (
              <li key={c.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-2 flex-1 items-center">
                    {c.icon_svg && (
                      <CategoryIcon svgCode={c.icon_svg} className="w-16 h-16 text-primary flex-shrink-0" />
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        slug: <span className="font-mono">{c.slug}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        создано: {formatDateTimeRu(c.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-0">
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
            <Label htmlFor="icon_svg">Иконка (SVG код)</Label>
            <Textarea
              id="icon_svg"
              name="icon_svg"
              rows={12}
              className="font-mono text-sm"
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">...</svg>'
            />
            <p className="text-xs text-muted-foreground">
              Вставьте SVG код. Используйте <span className="font-mono">currentColor</span> для fill/stroke, чтобы иконка использовала цвет акцента темы.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </section>
    </main>
  );
}


