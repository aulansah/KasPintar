import { supabase } from "./supabase";

/**
 * Ambil semua kategori living cost untuk satu summary_id beserta items-nya
 */
export async function getLivingCostCategories(summaryId) {
  const { data, error } = await supabase
    .from("living_cost_categories")
    .select(`
      *,
      items:living_cost_items (*)
    `)
    .eq("summary_id", summaryId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Ambil semua kategori untuk banyak summary_id sekaligus
 */
export async function getLivingCostCategoriesBySummaryIds(summaryIds) {
  if (!summaryIds || summaryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("living_cost_categories")
    .select(`
      *,
      items:living_cost_items (*)
    `)
    .in("summary_id", summaryIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Buat kategori baru */
export async function createLivingCostCategory(payload) {
  const { data, error } = await supabase
    .from("living_cost_categories")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update kategori berdasarkan id */
export async function updateLivingCostCategory(id, payload) {
  const { error } = await supabase
    .from("living_cost_categories")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

/** Hapus kategori berdasarkan id (items terhapus otomatis via ON DELETE CASCADE) */
export async function deleteLivingCostCategory(id) {
  const { error } = await supabase
    .from("living_cost_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/** Buat item living cost baru */
export async function createLivingCostItem(payload) {
  const { data, error } = await supabase
    .from("living_cost_items")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update item living cost berdasarkan id */
export async function updateLivingCostItem(id, payload) {
  const { error } = await supabase
    .from("living_cost_items")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

/** Hapus item living cost berdasarkan id */
export async function deleteLivingCostItem(id) {
  const { error } = await supabase
    .from("living_cost_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}