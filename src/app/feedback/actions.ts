"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitFeedback(formData: FormData) {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject || !message) {
    redirect("/feedback?error=empty_fields");
  }

  // Валидация длины
  if (subject.length > 200) {
    redirect("/feedback?error=subject_too_long");
  }

  if (message.length > 5000) {
    redirect("/feedback?error=message_too_long");
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("feedback_messages")
    .insert({
      user_id: user.id,
      subject,
      message,
      status: "new",
    });

  if (error) {
    redirect(`/feedback?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/feedback?success=1");
}

