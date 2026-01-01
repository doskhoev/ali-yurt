"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function createPlaceCategory(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const iconName = String(formData.get("icon_name") ?? "").trim();

  if (!title) return;

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("place_categories").insert({
    title,
    slug,
    icon_name: iconName || null,
  });

  if (error) {
    redirect(`/admin/place-categories?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/place-categories");
}

export async function deletePlaceCategory(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("place_categories").delete().eq("id", id);

  if (error) {
    // Likely a FK violation if some places reference this category.
    redirect(`/admin/place-categories?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/place-categories");
}

export async function updatePlaceCategory(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const iconName = String(formData.get("icon_name") ?? "").trim();

  if (!title) return;

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("place_categories")
    .update({
      title,
      slug,
      icon_name: iconName || null,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/place-categories/${id}?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/admin/place-categories/${id}`);
}


