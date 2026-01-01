"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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


