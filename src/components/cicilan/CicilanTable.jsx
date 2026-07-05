import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toRupiah, parseRupiah } from "../../utils/format";
import { debtMonthTotal, debtSummaryText } from "../../utils/calculate";

function InlineText({ value, onSave, placeholder = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  function commit() { if (draft !== value) onSave(draft); setEditing(false); }
  if (editing) return (
    <input autoFocus type="text" value={draft} placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="kp-inline-input" style={{ width: "100%", minWidth: 100, padding: "2px 6px", fontSize: "0.75rem" }}
    />
  );
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} className="kp-editable" style={{ padding: "1px 4px" }}>
      {value || <span style={{ color: "#cbd5e1" }}>{placeholder}</span>}
    </span>
  );
}

function InlineNumber({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  function commit() { onSave(parseRupiah(draft)); setEditing(false); }
  if (editing) return (
    <input autoFocus type="text" value={draft}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="kp-inline-input" style={{ width: 100, textAlign: "right", padding: "2px 6px", fontSize: "0.75rem" }}
    />
  );
  return (
    <span onClick={() => { setDraft(String(value || 0)); setEditing(true); }} className="kp-editable" style={{ display: "inline-block", textAlign: "right", padding: "1px 4px" }}>
      {toRupiah(value)}
    </span>
  );
}

export default function CicilanTable({
  summaries = [], debtMap = {}, transactionMap = {},
  onAddItem, onUpdateItem, onDeleteItem, onOpenTransactions,
}) {
  const [openMonth, setOpenMonth] = useState(null);

  function toggle(id) { setOpenMonth((p) => (p === id ? null : id)); }

  const grandTotal = summaries.reduce((sum, s) => sum + debtMonthTotal(debtMap[s.id] ?? []), 0);

  return (
    <div className="kp-card">
      <div className="kp-card__header" style={{ padding: "12px 16px" }}>
        <div>
          <div className="kp-card__title" style={{ fontSize: "0.85rem" }}>Rincian Cicilan / Pinjaman</div>
          <div className="kp-card__subtitle" style={{ fontSize: "0.68rem", marginTop: 2 }}>Klik baris bulan untuk melihat detail. Perubahan otomatis tersinkron ke Summary.</div>
        </div>
        <span className="kp-badge kp-badge--green" style={{ fontSize: "0.6rem" }}>Detail &amp; Terbayar</span>
      </div>

      <div className="kp-table-wrap">
        <table className="kp-table">
          <thead>
            <tr>
              <th className="center">Bulan</th>
              <th>Ringkasan Cicilan</th>
              <th className="right">Total Cicilan</th>
            </tr>
          </thead>
          <tbody>
            {summaries.length === 0 && (
              <tr><td colSpan={3} className="kp-empty">Belum ada data bulan. Tambahkan bulan di tab Summary Month.</td></tr>
            )}
            {summaries.map((s) => {
              const items = debtMap[s.id] ?? [];
              const monthTotal = debtMonthTotal(items);
              const isOpen = openMonth === s.id;

              return (
                <>
                  <tr key={s.id} className="kp-expand-row" onClick={() => toggle(s.id)}>
                    <td className="center">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {isOpen
                          ? <ChevronDown size={14} className="kp-expand-icon kp-expand-icon--open" />
                          : <ChevronRight size={14} className="kp-expand-icon" />
                        }
                        <span className="kp-month-label" style={{ fontSize: "0.8rem" }}>{s.bulan} {s.tahun}</span>
                      </span>
                    </td>
                    <td className="kp-summary-text" style={{ fontSize: "0.7rem" }}>{debtSummaryText(items)}</td>
                    <td className="right bold mono">{toRupiah(monthTotal)}</td>
                  </tr>

                  {isOpen && (
                    <tr key={`${s.id}-d`} className="kp-detail-panel">
                      <td colSpan={3}>
                        <div className="kp-detail-inner" style={{ margin: "10px 12px", padding: "12px" }}>
                          <div className="kp-detail-header" style={{ marginBottom: 12 }}>
                            <div>
                              <div className="kp-detail-label" style={{ fontSize: "0.6rem" }}>Detail Cicilan {s.bulan} {s.tahun}</div>
                              <div className="kp-detail-desc" style={{ fontSize: "0.7rem" }}>Pecah cicilan / pinjaman menjadi beberapa item. Total otomatis masuk ke Summary Month.</div>
                            </div>
                            <div className="kp-detail-total-box" style={{ padding: "6px 10px" }}>
                              <div className="kp-detail-total-label" style={{ fontSize: "0.55rem" }}>Total</div>
                              <div className="kp-detail-total-value" style={{ fontSize: "0.8rem" }}>{toRupiah(monthTotal)}</div>
                            </div>
                          </div>

                          <div style={{ overflowX: "auto" }}>
                            <table className="kp-sub-table">
                              <thead>
                                <tr>
                                  <th>Nama &amp; Catatan</th>
                                  <th className="right" style={{ width: 120 }}>Nominal</th>
                                  <th className="right" style={{ width: 120 }}>Terbayar</th>
                                  <th className="right" style={{ width: 50 }}>Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.length === 0 && (
                                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "16px 0", color: "#cbd5e1" }}>Belum ada item.</td></tr>
                                )}
                                {items.map((item) => {
                                  const spent = transactionMap[item.id] || 0;
                                  const isFullyPaid = spent >= item.amount && item.amount > 0;
                                  
                                  return (
                                    <tr key={item.id}>
                                      <td>
                                        <div style={{ fontWeight: 600, color: "#1e293b" }}>
                                          <InlineText value={item.name} placeholder="Nama cicilan" onSave={(v) => onUpdateItem(item.id, s.id, { name: v })} />
                                        </div>
                                        <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 2 }}>
                                          <InlineText value={item.note} placeholder="catatan..." onSave={(v) => onUpdateItem(item.id, s.id, { note: v })} />
                                        </div>
                                      </td>
                                      <td className="right font-mono" style={{ fontWeight: 600 }}>
                                        <InlineNumber value={item.amount} onSave={(v) => onUpdateItem(item.id, s.id, { amount: v })} />
                                      </td>
                                      <td className="right">
                                        {/* Interactive Terbayar Pill */}
                                        <button
                                          onClick={() => onOpenTransactions(item, "debt")}
                                          className={`kp-pill ${isFullyPaid ? "kp-pill--emerald" : spent > 0 ? "kp-pill--amber" : "kp-pill--rose"}`}
                                          style={{ borderStyle: "solid", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px" }}
                                        >
                                          <Plus size={10} strokeWidth={3} />
                                          <span style={{ fontFamily: "JetBrains Mono" }}>{toRupiah(spent)}</span>
                                        </button>
                                      </td>
                                      <td className="right">
                                        <button onClick={() => onDeleteItem(item.id, s.id)} className="kp-btn--icon delete" style={{ width: 28, height: 28 }} title="Hapus"><Trash2 size={12} /></button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <button onClick={() => onAddItem(s.id, s.user_id)} className="kp-btn kp-btn--dark kp-btn--sm" style={{ marginTop: 12 }}>
                            <Plus size={13} /> Tambah cicilan
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
          {summaries.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={2} className="label">Total Cicilan</td>
                <td className="right">{toRupiah(grandTotal)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
