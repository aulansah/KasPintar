import { supabase } from "./supabase";

/** Ambil semua summary bulan milik user, diurutkan berdasarkan tahun dan bulan */
export async function getMonthlySummary(userId) {
  const { data, error } = await supabase
    .from("monthly_summary")
    .select("*")
    .eq("user_id", userId)
    .order("tahun", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Buat satu baris summary baru */
export async function createSummary(payload) {
  const { data, error } = await supabase
    .from("monthly_summary")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update satu baris summary berdasarkan id */
export async function updateSummary(id, payload) {
  const { error } = await supabase
    .from("monthly_summary")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

/** Hapus satu baris summary berdasarkan id */
export async function deleteSummary(id) {
  const { error } = await supabase
    .from("monthly_summary")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Alias untuk backward compat
export { getMonthlySummary as getSummary };