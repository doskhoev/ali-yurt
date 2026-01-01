"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/auth/admin";

export async function createNewsComment(formData: FormData) {
  const entityId = String(formData.get("entity_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!entityId || !body) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  await supabase.from("comments").insert({
    entity_type: "news",
    entity_id: entityId,
    author_id: user.id,
    body,
  });

  const h = await headers();
  const referer = h.get("referer");
  redirect(referer ?? "/news");
}

export async function deleteComment(commentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  await supabase.from("comments").delete().eq("id", commentId);

  const h = await headers();
  const referer = h.get("referer");
  redirect(referer ?? "/news");
}


