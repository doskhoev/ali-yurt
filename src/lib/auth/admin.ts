import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getIsAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("is_admin");

  if (error) return false;
  return Boolean(data);
}


