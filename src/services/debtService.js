import { supabase } from "./supabase";

/** Ambil semua debt items untuk satu summary_id */
export async function getDebtItems(summaryId) {
  const { data, error } = await supabase
    .from("debt_items")
    .select("*")
    .eq("summary_id", summaryId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Buat debt item baru */
export async function createDebtItem(payload) {
  const { data, error } = await supabase
    .from("debt_items")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update debt item berdasarkan id */
export async function updateDebtItem(id, payload) {
  const { error } = await supabase
    .from("debt_items")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

/** Hapus debt item berdasarkan id */
export async function deleteDebtItem(id) {
  const { error } = await supabase
    .from("debt_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/** Ambil semua debt items untuk banyak summary_id sekaligus */
export async function getDebtItemsBySummaryIds(summaryIds) {
  if (!summaryIds || summaryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("debt_items")
    .select("*")
    .in("summary_id", summaryIds)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
