"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { PLACE_COVER_BUCKET } from "@/lib/storage";

export async function createPlace(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const publish = String(formData.get("publish") ?? "") === "1";

  if (!title || !content || !categoryId) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const id = crypto.randomUUID();
  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const { error } = await supabase
    .from("places")
    .insert({
      id,
      title,
      slug,
      category_id: categoryId,
      excerpt: excerpt || null,
      content,
      author_id: user.id,
      published_at: publish ? new Date().toISOString() : null,
    })

  if (error) {
    redirect(`/admin/places/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/places/${id}`);
}

export async function updatePlace(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const publish = String(formData.get("publish") ?? "") === "1";

  if (!title || !content || !categoryId) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const { data: existing } = await supabase
    .from("places")
    .select("published_at")
    .eq("id", id)
    .single();

  const nextPublishedAt = publish
    ? existing?.published_at ?? new Date().toISOString()
    : null;

  const { error } = await supabase
    .from("places")
    .update({
      title,
      slug,
      category_id: categoryId,
      excerpt: excerpt || null,
      content,
      published_at: nextPublishedAt,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/places/${id}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/places");
}

export async function deletePlace(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("places").delete().eq("id", id);

  if (error) {
    redirect(`/admin/places/${id}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/places");
}

export async function uploadPlaceImage(id: string, formData: FormData) {
  const files = formData.getAll("images") as File[];
  const validFiles = files.filter((file) => file && file.size > 0);

  if (validFiles.length === 0) {
    redirect(`/admin/places/${id}?error=${encodeURIComponent("Файлы не выбраны")}`);
  }

  const supabase = await createSupabaseServerClient();

  // Получаем текущий массив изображений
  const { data: place } = await supabase
    .from("places")
    .select("image_paths")
    .eq("id", id)
    .single();

  const currentPaths = (place?.image_paths || []) as string[];
  const newPaths: string[] = [...currentPaths];

  // Загружаем все файлы
  for (const file of validFiles) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const objectPath = `places/${id}/${crypto.randomUUID()}.${ext}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(PLACE_COVER_BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      redirect(`/admin/places/${id}?error=${encodeURIComponent(uploadError.message)}`);
    }

    newPaths.push(objectPath);
  }

  // Обновляем массив в БД
  const { error: updateError } = await supabase
    .from("places")
    .update({ image_paths: newPaths })
    .eq("id", id);

  if (updateError) {
    redirect(`/admin/places/${id}?error=${encodeURIComponent(updateError.message)}`);
  }

  redirect(`/admin/places/${id}`);
}

export async function deletePlaceImage(id: string, imagePath: string) {
  const supabase = await createSupabaseServerClient();

  // Получаем текущий массив
  const { data: place } = await supabase
    .from("places")
    .select("image_paths")
    .eq("id", id)
    .single();

  const currentPaths = (place?.image_paths || []) as string[];
  
  // Удаляем путь из массива
  const newPaths = currentPaths.filter(path => path !== imagePath);

  // Удаляем файл из storage
  await supabase.storage
    .from(PLACE_COVER_BUCKET)
    .remove([imagePath]);

  // Обновляем массив в БД
  await supabase
    .from("places")
    .update({ image_paths: newPaths })
    .eq("id", id);

  redirect(`/admin/places/${id}`);
}


