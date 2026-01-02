import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deletePlace, updatePlace, uploadPlaceImage, deletePlaceImage } from "../actions";
import { PLACE_COVER_BUCKET } from "@/lib/storage";
import { CategorySelect } from "@/components/CategorySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { ViewOnSiteButton } from "@/components/ViewOnSiteButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormCheckbox } from "@/components/FormCheckbox";
import { DeleteButton } from "@/components/DeleteButton";

type SearchParams = Record<string, string | string[] | undefined>;

type PlaceRow = {
  id: string;
  slug: string;
  title: string;
  category_id: string | null;
  image_paths: string[];
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
        <p className="text-sm text-muted-foreground">Ожидался UUID.</p>
        <Link
          href="/admin/places"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Назад
        </Link>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("places")
    .select(
      "id, slug, title, category_id, image_paths, excerpt, content, published_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error || !row) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Место не найдено</h1>
        <p className="text-sm text-red-600">{error?.message ?? "not found"}</p>
        <Link
          href="/admin/places"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Назад
        </Link>
      </main>
    );
  }

  const item = row as PlaceRow;

  const { data: categories, error: catError } = await supabase
    .from("place_categories")
    .select("id, title, icon_svg")
    .order("title", { ascending: true })
    .limit(500);

  const catItems = ((categories ?? []) as { id: string; title: string; icon_svg: string | null }[]).filter(
    Boolean
  );

  const errParam = searchParams?.error;
  const err = Array.isArray(errParam) ? errParam[0] : errParam;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Редактировать место</h1>
          <Link
            href="/admin/places"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← К списку
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          обновлено: {formatDateTimeRu(item.updated_at)} · статус:{" "}
          {item.published_at ? "опубликовано" : "черновик"}
        </p>
        {(err || catError) && (
          <p className="text-sm text-red-600">
            Ошибка: {decodeURIComponent(err ?? catError?.message ?? "")}
          </p>
        )}
      </header>

      <section className="rounded-xl border p-4 space-y-3">
        <div className="font-medium">Изображения</div>

        {item.image_paths && item.image_paths.length > 0 ? (
          <div className="space-y-4">
            {item.image_paths.map((imagePath, index) => {
              const imageUrl = supabase.storage
                .from(PLACE_COVER_BUCKET)
                .getPublicUrl(imagePath).data.publicUrl;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-center">
                    <Image
                      src={imageUrl}
                      alt={`${item.title} - изображение ${index + 1}`}
                      width={800}
                      height={400}
                      className="max-w-full max-h-[400px] w-auto h-auto object-contain rounded-xl border"
                      style={{ height: "auto" }}
                    />
                  </div>
                  <form action={deletePlaceImage.bind(null, item.id, imagePath)} className="flex justify-center">
                    <SubmitButton variant="destructive" size="sm">
                      Удалить изображение
                    </SubmitButton>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Изображения не загружены.</p>
        )}

        <form
          action={uploadPlaceImage.bind(null, item.id)}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
        >
          <div className="space-y-2">
            <Label htmlFor="images">Загрузить изображения</Label>
            <Input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="text-sm"
              required
            />
          </div>
          <SubmitButton variant="outline" size="sm">
            Загрузить
          </SubmitButton>
        </form>
        <p className="text-xs text-muted-foreground">
          Можно выбрать несколько файлов. Файлы загрузятся в Supabase Storage bucket{" "}
          <span className="font-mono">{PLACE_COVER_BUCKET}</span>, пути будут
          добавлены в массив <span className="font-mono">places.image_paths</span>.
        </p>
      </section>

      <form action={updatePlace.bind(null, item.id)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category_id">
            Категория <span className="text-red-600">*</span>
          </Label>
          <CategorySelect
            name="category_id"
            categories={catItems}
            defaultValue={item.category_id ?? ""}
            required
            placeholder="Выберите категорию…"
          />
        </div>

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
          <Label htmlFor="excerpt">Короткое описание (excerpt)</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            defaultValue={item.excerpt ?? ""}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">
            Контент (Markdown) <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="content"
            name="content"
            required
            defaultValue={item.content}
            rows={14}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <FormCheckbox
            id="publish"
            name="publish"
            value="1"
            defaultChecked={Boolean(item.published_at)}
          />
          <Label
            htmlFor="publish"
            className="text-sm font-normal cursor-pointer"
          >
            Опубликовано
          </Label>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SubmitButton>Сохранить</SubmitButton>
            {item.published_at && (
              <ViewOnSiteButton href={`/places/${item.slug}`} />
            )}
          </div>
          <DeleteButton
            formId={`delete-place-${item.id}`}
            description="Место будет удалено безвозвратно."
          />
        </div>
      </form>

      <form action={deletePlace.bind(null, item.id)} id={`delete-place-${item.id}`}>
      </form>
    </main>
  );
}


