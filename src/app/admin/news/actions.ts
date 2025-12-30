"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function createNews(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const publish = String(formData.get("publish") ?? "") === "1";

  if (!title || !content) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const id = crypto.randomUUID();
  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const { error } = await supabase
    .from("news")
    .insert({
      id,
      title,
      slug,
      excerpt: excerpt || null,
      content,
      author_id: user.id,
      published_at: publish ? new Date().toISOString() : null,
    })

  if (error) {
    redirect(`/admin/news/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/news/${id}`);
}

export async function updateNews(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const publish = String(formData.get("publish") ?? "") === "1";

  if (!title || !content) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const { data: existing } = await supabase
    .from("news")
    .select("published_at")
    .eq("id", id)
    .single();

  const nextPublishedAt = publish
    ? existing?.published_at ?? new Date().toISOString()
    : null;

  const { error } = await supabase
    .from("news")
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      published_at: nextPublishedAt,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/news/${id}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/news/${id}`);
}


