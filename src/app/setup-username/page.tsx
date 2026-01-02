import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setupUsername } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SetupUsernamePage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  // Проверяем, есть ли уже username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username) {
    // Username уже установлен, редирект на главную
    redirect("/");
  }

  const error = searchParams?.error;

  return (
    <main className="mx-auto max-w-md px-6 py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Установите ваш username</CardTitle>
          <CardDescription>
            Выберите уникальное имя пользователя. Это имя будет отображаться в ваших комментариях и не может быть изменено позже.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                {error === "username_taken"
                  ? "Этот username уже занят. Выберите другой."
                  : error === "invalid_username"
                  ? "Username должен содержать от 1 до 50 символов."
                  : "Произошла ошибка. Попробуйте еще раз."}
              </p>
            </div>
          )}

          <form action={setupUsername} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                minLength={1}
                maxLength={50}
                placeholder="например: Иван Петров"
                autoComplete="username"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Любой текст, включая пробелы (1-50 символов)
              </p>
            </div>

            <SubmitButton className="w-full">
              Сохранить
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

