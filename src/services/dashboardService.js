import { supabase } from "./supabase";

export async function getMonthlySummary(userId) {
  const { data, error } = await supabase
    .from("monthly_summary")
    .select("*")
    .eq("user_id", userId)
    .order("tahun", { ascending: false });

  if (error) throw error;

  return data ?? [];
}