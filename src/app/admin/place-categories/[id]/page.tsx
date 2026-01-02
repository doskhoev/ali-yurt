import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deletePlaceCategory, updatePlaceCategory } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminPlaceCategoryEditPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: SearchParams;
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  if (!id || !UUID_RE.test(id)) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Некорректный ID</h1>
        <p className="text-sm text-muted-foreground">Ожидался UUID.</p>
        <Link
          href="/admin/place-categories"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Назад
        </Link>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("place_categories")
    .select("id, slug, title, icon_svg, created_at")
    .eq("id", id)
    .single();

  if (error || !row) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Категория не найдена</h1>
        <p className="text-sm text-red-600">{error?.message ?? "not found"}</p>
        <Link
          href="/admin/place-categories"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Назад
        </Link>
      </main>
    );
  }

  const item = row as CategoryRow;

  const errParam = searchParams?.error;
  const err = Array.isArray(errParam) ? errParam[0] : errParam;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Редактировать категорию</h1>
          <Link
            href="/admin/place-categories"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← К списку
          </Link>
        </div>
        <div className="text-xs text-muted-foreground">
          id: <span className="font-mono">{item.id}</span>
        </div>
        {err && (
          <p className="text-sm text-red-600">Ошибка: {decodeURIComponent(err)}</p>
        )}
      </header>

      <form action={updatePlaceCategory.bind(null, item.id)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Название <span className="text-red-600">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={item.title}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={item.slug} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon_svg">Иконка (SVG код)</Label>
          <Textarea
            id="icon_svg"
            name="icon_svg"
            rows={12}
            className="font-mono text-sm"
            defaultValue={item.icon_svg ?? ""}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">...</svg>'
          />
          <p className="text-xs text-muted-foreground">
            Вставьте SVG код. Используйте <span className="font-mono">currentColor</span> для fill/stroke, чтобы иконка использовала цвет акцента темы.
          </p>
          {item.icon_svg && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50 flex items-center justify-center min-h-[100px]">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">Предпросмотр:</p>
                <CategoryIcon svgCode={item.icon_svg} className="w-16 h-16 text-primary" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <SubmitButton>Сохранить</SubmitButton>
          <DeleteButton
            formId={`delete-category-${item.id}`}
            description="Категория будет удалена безвозвратно."
          />
        </div>
      </form>

      <form action={deletePlaceCategory.bind(null, item.id)} id={`delete-category-${item.id}`}>
      </form>
    </main>
  );
}


