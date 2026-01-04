"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/auth/admin";

export async function updateFeedbackStatus(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  const status = String(formData.get("status") ?? "").trim();
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();

  if (!["new", "in_progress", "resolved", "closed"].includes(status)) {
    redirect(`/admin/feedback/${id}?error=invalid_status`);
  }

  const updateData: { status: string; admin_notes?: string | null } = {
    status,
  };

  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes || null;
  }

  const { error } = await supabase
    .from("feedback_messages")
    .update(updateData)
    .eq("id", id);

  if (error) {
    redirect(`/admin/feedback/${id}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/feedback/${id}?success=1`);
}

export async function deleteFeedback(id: string) {
  const supabase = await createSupabaseServerClient();
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  const { error } = await supabase
    .from("feedback_messages")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(`/admin/feedback/${id}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/feedback");
}

