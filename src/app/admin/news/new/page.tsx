import { createNews } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormCheckbox } from "@/components/FormCheckbox";

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
        <p className="text-sm text-muted-foreground">Контент в Markdown.</p>
        {error && (
          <p className="text-sm text-red-600">Ошибка: {decodeURIComponent(error)}</p>
        )}
      </header>

      <form action={createNews} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Заголовок <span className="text-red-600">*</span>
          </Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (иначе будет из заголовка)</Label>
          <Input id="slug" name="slug" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Короткое описание (excerpt)</Label>
          <Textarea id="excerpt" name="excerpt" rows={2} />
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


