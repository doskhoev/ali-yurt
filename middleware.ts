import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Функция для установки заголовка pathname
  const setPathnameHeader = (resp: NextResponse) => {
    resp.headers.set("x-pathname", pathname);
    return resp;
  };

  // Передаем pathname в headers для использования в layout
  response = setPathnameHeader(response);

  // Пропускаем проверку для публичных путей
  const publicPaths = ["/login", "/auth/callback", "/setup-username", "/icon"];
  if (publicPaths.includes(pathname)) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply to the request (so subsequent middleware/handlers can see them)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Recreate the response to ensure cookies are set correctly
          response = NextResponse.next({ request });
          
          // Восстанавливаем заголовок pathname после пересоздания response
          response = setPathnameHeader(response);

          // Apply to the response (so the browser receives them)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Important: this refreshes the session if needed
  const { data: { user } } = await supabase.auth.getUser();

  // Если пользователь залогинен, проверяем наличие username
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    // Если профиля нет или username не установлен, редиректим на страницу установки
    // profileError может быть из-за RLS, но это нормально - значит профиля нет
    // Проверяем явно: profile === null или profile.username === null или profile.username === ""
    const hasUsername = profile?.username && profile.username.trim().length > 0;
    
    if (!hasUsername && pathname !== "/setup-username") {
      const redirectUrl = new URL("/setup-username", request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.headers.set("x-pathname", "/setup-username");
      return redirectResponse;
    }
  }

  // Убеждаемся, что заголовок установлен перед возвратом
  response = setPathnameHeader(response);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};


