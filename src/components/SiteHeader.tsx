import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { getIsAdmin } from "@/lib/auth/admin";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const isAdmin = user ? await getIsAdmin() : false;

  return (
    <header className="border-b">
      <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold">
            Ali-Yurt
          </Link>
          <Link href="/news" className="text-sm text-zinc-700 hover:text-black">
            Новости
          </Link>
          <Link
            href="/places"
            className="text-sm text-zinc-700 hover:text-black"
          >
            Места
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm text-zinc-700 hover:text-black">
              Админка
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-700 hover:text-black"
            >
              Вход
            </Link>
          ) : (
            <>
              <span className="text-xs text-zinc-600 hidden sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm font-medium text-zinc-700 hover:text-black"
                >
                  Выйти
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


