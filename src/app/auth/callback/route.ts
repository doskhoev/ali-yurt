import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL("/login?error=auth_failed", url.origin));
    }

    // После успешной авторизации проверяем, есть ли профиль
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
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
  }

  return NextResponse.redirect(new URL("/", url.origin));
}


