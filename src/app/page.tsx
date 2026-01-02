import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Главная",
  description:
    "Справочник жителя села Али-Юрт: новости, интересные места и объявления.",
};

type SearchParams = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // Обработка кода авторизации, если он попал на главную страницу (fallback)
  const resolvedSearchParams = await Promise.resolve(searchParams || {});
  const codeParam = resolvedSearchParams?.code;
  const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;
  
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // После успешной авторизации проверяем, есть ли профиль
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("id", user.id)
          .maybeSingle();

        // Если профиля нет, создаем его (без username, он установится позже)
        if (!profile) {
          await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email || null,
            });
        }
      }
      // Успешная авторизация, редирект без параметра code
      redirect("/");
    }
  }

  // Проверяем, нужно ли редиректить на установку username
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    // Если профиля нет или username не установлен, редиректим
    if (!profile || !profile.username) {
      redirect("/setup-username");
    }
  }

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
