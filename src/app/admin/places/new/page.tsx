import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPlace } from "../actions";
import { CategorySelect } from "@/components/CategorySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormCheckbox } from "@/components/FormCheckbox";

type SearchParams = Record<string, string | string[] | undefined>;

type CategoryRow = { id: string; title: string; icon_svg: string | null };

export default async function AdminPlaceNewPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const errorParam = searchParams?.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  const supabase = await createSupabaseServerClient();
  const { data: categories, error: catError } = await supabase
    .from("place_categories")
    .select("id, title, icon_svg")
    .order("title", { ascending: true })
    .limit(500);

  const items = ((categories ?? []) as CategoryRow[]).filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Новое место</h1>
        <p className="text-sm text-muted-foreground">Контент в Markdown.</p>
        {(error || catError) && (
          <p className="text-sm text-red-600">
            Ошибка: {decodeURIComponent(error ?? catError?.message ?? "")}
          </p>
        )}
      </header>

      <form action={createPlace} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category_id">
            Категория <span className="text-red-600">*</span>
          </Label>
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Сначала добавь категории в /admin/place-categories.
            </p>
          ) : (
            <CategorySelect
              name="category_id"
              categories={items}
              required
              placeholder="Выберите категорию…"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">
            Название <span className="text-red-600">*</span>
          </Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (иначе будет из названия)</Label>
          <Input id="slug" name="slug" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Короткое описание (excerpt)</Label>
          <Textarea id="excerpt" name="excerpt" rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Широта (latitude)</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              placeholder="43.12345678"
            />
            <p className="text-xs text-muted-foreground">
              От -90 до 90
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Долгота (longitude)</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              placeholder="44.12345678"
            />
            <p className="text-xs text-muted-foreground">
              От -180 до 180
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">
            Контент (Markdown) <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="content"
            name="content"
            required
            rows={14}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <FormCheckbox id="publish" name="publish" value="1" />
          <Label
            htmlFor="publish"
            className="text-sm font-normal cursor-pointer"
          >
            Опубликовать сразу
          </Label>
        </div>

        <SubmitButton>Создать</SubmitButton>
      </form>
    </main>
  );
}


