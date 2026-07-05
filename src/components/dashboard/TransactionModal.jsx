import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, Calendar, DollarSign, FileText } from "lucide-react";
import { getTransactionsByItemId, createTransaction, deleteTransaction } from "../../services/transactionService";
import { toRupiah, parseRupiah } from "../../utils/format";

export default function TransactionModal({ open, item, itemType, onClose, onSaveSuccess }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: "", note: "", date: "" });
  const [saving, setSaving] = useState(false);
  const amountRef = useRef(null);

  // Set today's date formatted as YYYY-MM-DD
  function getTodayString() {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().split("T")[0];
  }

  useEffect(() => {
    if (open && item) {
      setForm({ amount: "", note: "", date: getTodayString() });
      loadTransactions();
      setTimeout(() => amountRef.current?.focus(), 100);
    }
  }, [open, item]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const list = await getTransactionsByItemId(item.id);
      setTransactions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totalBudget = itemType === "debt" ? Number(item?.amount || 0) : (Number(item?.qty || 0) * Number(item?.trips || 0) * Number(item?.unit_cost || 0));
  const totalSpent = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100).toFixed(1) : "0.0";

  async function handleAdd(e) {
    e.preventDefault();
    const parsedAmt = parseRupiah(form.amount);
    if (!parsedAmt || parsedAmt <= 0) return alert("Masukkan nominal pengeluaran yang valid");

    setSaving(true);
    try {
      const newTx = await createTransaction({
        user_id: item.user_id,
        item_id: item.id,
        item_type: itemType,
        amount: parsedAmt,
        transaction_date: form.date || getTodayString(),
        note: form.note.trim(),
      });
      setTransactions((prev) => [newTx, ...prev]);
      setForm({ amount: "", note: "", date: getTodayString() });
      onSaveSuccess();
      amountRef.current?.focus();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(txId) {
    if (!window.confirm("Hapus catatan pengeluaran ini?")) return;
    try {
      await deleteTransaction(txId);
      setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
      onSaveSuccess();
    } catch (err) {
      alert(err.message);
    }
  }

  function formatDateId(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  }

  if (!open || !item) return null;

  return (
    <div className="kp-modal-overlay" style={{ padding: "0.5rem" }}>
      <div className="kp-modal" style={{ maxWidth: "480px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div className="kp-modal__header" style={{ padding: "1rem 1.25rem" }}>
          <div>
            <span className="kp-modal__title" style={{ fontSize: "1.05rem" }}>Riwayat &amp; Input Terbayar</span>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
              Item: <strong>{item.name}</strong>
            </div>
          </div>
          <button onClick={onClose} className="kp-btn--icon" style={{ width: 30, height: 30 }}><X size={16} /></button>
        </div>

        {/* Progress Summary Card */}
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", uppercase: true }}>Status Terpakai</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: remaining >= 0 ? "#059669" : "#e11d48" }}>
              {pct}% ({toRupiah(totalSpent)} / {toRupiah(totalBudget)})
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: remaining >= 0 ? "#10b981" : "#f43f5e", transition: "width 0.3s ease" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#64748b" }}>
            <span>Sisa Anggaran:</span>
            <span style={{ fontWeight: 700 }}>{toRupiah(remaining)}</span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="custom-scrollbar" style={{ overflowY: "auto", flex: 1, padding: "1.25rem" }}>
          
          {/* Add Form */}
          <form onSubmit={handleAdd} style={{ background: "#ecfdf5", border: "1px solid #d1fae5", borderRadius: 14, padding: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              + Catat Pengeluaran Baru
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div className="kp-field">
                <label style={{ fontSize: "0.6rem" }}>Nominal</label>
                <div style={{ position: "relative" }}>
                  <input
                    ref={amountRef}
                    type="text"
                    placeholder="Rp 0"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                    style={{ fontSize: "0.8rem", padding: "8px 10px", fontFamily: "JetBrains Mono" }}
                  />
                </div>
              </div>

              <div className="kp-field">
                <label style={{ fontSize: "0.6rem" }}>Tanggal</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  required
                  style={{ fontSize: "0.8rem", padding: "8px 10px" }}
                />
              </div>
            </div>

            <div className="kp-field" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: "0.6rem" }}>Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                placeholder="misal: Makan siang geprek, bayar via QRIS..."
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                style={{ fontSize: "0.8rem", padding: "8px 10px" }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="kp-btn kp-btn--primary"
              style={{ width: "100%", justifyContent: "center", padding: "8px 12px", fontSize: "0.75rem", opacity: saving ? 0.7 : 1 }}
            >
              <Plus size={14} /> {saving ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </form>

          {/* Transactions List */}
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Riwayat Pengeluaran
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "1rem", color: "#94a3b8", fontSize: "0.75rem" }}>Memuat riwayat...</div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem", border: "1px dashed #e2e8f0", borderRadius: 12, color: "#94a3b8", fontSize: "0.75rem" }}>
                Belum ada transaksi dicatat untuk item ini.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      border: "1px solid #f1f5f9",
                      borderRadius: 10,
                      background: "#fff",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e293b" }}>{toRupiah(tx.amount)}</span>
                        <span style={{ fontSize: "0.58rem", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                          {formatDateId(tx.transaction_date)}
                        </span>
                      </div>
                      {tx.note && <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2 }}>{tx.note}</div>}
                    </div>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="kp-btn--icon delete"
                      style={{ width: 28, height: 28 }}
                      title="Hapus"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
