import Link from "next/link";
import { Settings, User } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/auth/admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";
import { MobileMenu } from "@/components/MobileMenu";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const isAdmin = user ? await getIsAdmin() : false;

  // Получаем username из профиля
  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = profile?.username || null;
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-12">
          <MobileMenu isAdmin={isAdmin} user={user} username={username} />
          <Link href="/" className="font-semibold">
            Али-Юрт
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground">
              Новости
            </Link>
            <Link
              href="/places"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Места
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              О селе
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Админка
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Вход
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{username || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Аккаунт</p>
                    {username ? (
                      <p className="text-xs leading-none text-muted-foreground">
                        {username}
                      </p>
                    ) : (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Настройки</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}


