import { supabase } from "./supabase";

/** Ambil semua summary bulan milik user, diurutkan berdasarkan tahun dan bulan */
export async function getMonthlySummary(userId) {
  const { data, error } = await supabase
    .from("monthly_summary")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  const monthOrder = {
    "Januari": 1, "Februari": 2, "Maret": 3, "April": 4, "Mei": 5, "Juni": 6,
    "Juli": 7, "Agustus": 8, "September": 9, "Oktober": 10, "November": 11, "Desember": 12
  };

  const sorted = (data ?? []).sort((a, b) => {
    if (a.tahun !== b.tahun) {
      return a.tahun - b.tahun;
    }
    return (monthOrder[a.bulan] || 0) - (monthOrder[b.bulan] || 0);
  });

  return sorted;
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