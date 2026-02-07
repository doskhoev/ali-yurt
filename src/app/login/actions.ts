"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendLoginCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?error=missing_email");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("Error sending login code:", error);
    if (error.code === "over_email_send_rate_limit") {
      redirect(`/login?error=rate_limit&email=${encodeURIComponent(email)}`);
    }
    redirect(`/login?error=send_failed&email=${encodeURIComponent(email)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function verifyLoginCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!email) redirect("/login?error=missing_email");
  if (!/^\d{8}$/.test(token)) redirect(`/login?error=invalid_code&email=${encodeURIComponent(email)}`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("Error verifying login code:", error);
    redirect(`/login?error=verify_failed&email=${encodeURIComponent(email)}`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || null,
        });
    }
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}


