"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { NEWS_COVER_BUCKET } from "@/lib/storage";

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

  redirect("/admin/news");
}

export async function deleteNews(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    redirect(`/admin/news/${id}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/news");
}

export async function uploadNewsCover(id: string, formData: FormData) {
  const file = formData.get("cover") as File | null;
  if (!file || file.size === 0) {
    redirect(`/admin/news/${id}?error=${encodeURIComponent("Файл не выбран")}`);
  }

  const supabase = await createSupabaseServerClient();

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const objectPath = `news/${id}/cover.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(NEWS_COVER_BUCKET)
    .upload(objectPath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    redirect(`/admin/news/${id}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: updateError } = await supabase
    .from("news")
    .update({ cover_image_path: objectPath })
    .eq("id", id);

  if (updateError) {
    redirect(`/admin/news/${id}?error=${encodeURIComponent(updateError.message)}`);
  }

  redirect(`/admin/news/${id}`);
}


