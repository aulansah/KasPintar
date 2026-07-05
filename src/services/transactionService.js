import { supabase } from "./supabase";

/** Ambil semua transaksi milik user */
export async function getTransactions(userId) {
  const { data, error } = await supabase
    .from("transactions_log")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Ambil transaksi berdasarkan item_id */
export async function getTransactionsByItemId(itemId) {
  const { data, error } = await supabase
    .from("transactions_log")
    .select("*")
    .eq("item_id", itemId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Buat transaksi baru */
export async function createTransaction(payload) {
  const { data, error } = await supabase
    .from("transactions_log")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Hapus transaksi */
export async function deleteTransaction(transactionId) {
  const { error } = await supabase
    .from("transactions_log")
    .delete()
    .eq("id", transactionId);

  if (error) throw error;
}
