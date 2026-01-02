"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MIN_USERNAME_LENGTH = 1;
const MAX_USERNAME_LENGTH = 50;

export async function setupUsername(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();

  if (!username) {
    redirect("/setup-username?error=invalid_username");
  }

  // Валидация длины
  if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    redirect("/setup-username?error=invalid_username");
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  // Проверяем, есть ли уже username
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile?.username) {
    // Username уже установлен, нельзя изменить
    redirect("/");
  }

  // Проверяем уникальность username
  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUsername) {
    redirect("/setup-username?error=username_taken");
  }

  // Обновляем или создаем профиль с username
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        username,
        email: user.email || null,
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    // Если ошибка уникальности, значит username занят
    if (error.code === "23505") {
      redirect("/setup-username?error=username_taken");
    }
    redirect("/setup-username?error=unknown");
  }

  redirect("/");
}

