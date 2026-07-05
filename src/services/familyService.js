import { supabase } from "./supabase";

/** Ambil family_items untuk satu summary_id */
export async function getFamilyItems(summaryId) {
  const { data, error } = await supabase
    .from("family_items")
    .select("*")
    .eq("summary_id", summaryId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Ambil family_items untuk banyak summary_id sekaligus */
export async function getFamilyItemsBySummaryIds(summaryIds) {
  if (!summaryIds || summaryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("family_items")
    .select("*")
    .in("summary_id", summaryIds)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Buat atau update family_item (upsert: satu record per bulan) */
export async function upsertFamilyItem(summaryId, userId, payload) {
  // Cek apakah sudah ada record untuk summary_id ini
  const { data: existing, error: fetchError } = await supabase
    .from("family_items")
    .select("id")
    .eq("summary_id", summaryId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    const { error } = await supabase
      .from("family_items")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  } else {
    const { data, error } = await supabase
      .from("family_items")
      .insert({ ...payload, summary_id: summaryId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  }
}

/** Hapus family_item berdasarkan id */
export async function deleteFamilyItem(id) {
  const { error } = await supabase
    .from("family_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
