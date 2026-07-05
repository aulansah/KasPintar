import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Receipt } from "lucide-react";
import { toRupiah, parseRupiah } from "../../utils/format";
import { itemSubtotal, categoryAmount, totalLivingCost } from "../../utils/calculate";

function InlineText({ value, onSave, placeholder = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  function commit() { if (draft !== value) onSave(draft); setEditing(false); }
  if (editing) return (
    <input autoFocus type="text" value={draft} placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="kp-inline-input" style={{ width: "100%", minWidth: 80, padding: "2px 6px", fontSize: "0.7rem" }}
    />
  );
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} className="kp-editable" style={{ fontSize: "inherit", padding: "1px 4px" }}>
      {value || <span style={{ color: "#cbd5e1" }}>{placeholder}</span>}
    </span>
  );
}

function InlineNumber({ value, onSave, style: st = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  function commit() { onSave(parseRupiah(draft)); setEditing(false); }
  if (editing) return (
    <input autoFocus type="text" value={draft}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="kp-inline-input" style={{ width: 60, textAlign: "right", padding: "2px 6px", fontSize: "0.7rem", ...st }}
    />
  );
  return (
    <span onClick={() => { setDraft(String(value || 0)); setEditing(true); }} className="kp-editable" style={{ display: "inline-block", textAlign: "right", padding: "1px 4px", fontSize: "inherit" }}>
      {value}
    </span>
  );
}

export default function LivingCostTable({
  summaries = [], livingMap = {}, transactionMap = {},
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddItem, onUpdateItem, onDeleteItem, onOpenTransactions,
}) {
  const [openSummary, setOpenSummary] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  function toggleSummary(id) { setOpenSummary((p) => (p === id ? null : id)); setOpenCategory(null); }
  function toggleCategory(id) { setOpenCategory((p) => (p === id ? null : id)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {summaries.length === 0 && (
        <div className="kp-card"><div className="kp-empty">Belum ada data bulan. Tambahkan bulan di tab Summary Month.</div></div>
      )}

      {summaries.map((s) => {
        const cats = livingMap[s.id] ?? [];
        const totalLC = totalLivingCost(cats);
        const isOpenS = openSummary === s.id;

        return (
          <div key={s.id} className="kp-card">
            {/* Month row */}
            <div className="kp-card__header" style={{ cursor: "pointer", padding: "12px 16px" }} onClick={() => toggleSummary(s.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                {isOpenS
                  ? <ChevronDown size={16} className="kp-expand-icon kp-expand-icon--open" />
                  : <ChevronRight size={16} className="kp-expand-icon" />
                }
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="kp-card__title" style={{ fontSize: "0.85rem" }}>Living Cost — {s.bulan} {s.tahun}</div>
                  <div className="kp-card__subtitle" style={{ fontSize: "0.68rem", marginTop: 2 }}>
                    {cats.length} kategori · Rencana: <strong style={{ color: "#0f172a" }}>{toRupiah(totalLC)}</strong>
                  </div>
                </div>
              </div>
              <span className="kp-badge kp-badge--green" style={{ fontSize: "0.6rem" }}>Detail &amp; Terbayar</span>
            </div>

            {isOpenS && (
              <>
                <div className="kp-table-wrap">
                  <table className="kp-table">
                    <thead>
                      <tr>
                        <th>Kategori Pengeluaran</th>
                        <th>Ringkasan</th>
                        <th className="right">Anggaran</th>
                        <th className="right">Porsi (%)</th>
                        <th className="center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cats.length === 0 && (
                        <tr><td colSpan={5} className="kp-empty">Belum ada kategori. Klik "Tambah Kategori" di bawah.</td></tr>
                      )}
                      {cats.map((cat) => {
                        const catTotal = categoryAmount(cat);
                        const pct = totalLC > 0 ? ((catTotal / totalLC) * 100).toFixed(1) : "0.0";
                        const isOpenC = openCategory === cat.id;

                        return (
                          <>
                            <tr key={cat.id}>
                              <td>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                  <span onClick={() => toggleCategory(cat.id)} style={{ cursor: "pointer", display: "inline-flex" }}>
                                    {isOpenC
                                      ? <ChevronDown size={13} className="kp-expand-icon kp-expand-icon--open" />
                                      : <ChevronRight size={13} className="kp-expand-icon" />
                                    }
                                  </span>
                                  <InlineText value={cat.name} placeholder="Nama kategori" onSave={(v) => onUpdateCategory(cat.id, s.id, { name: v })} />
                                </span>
                              </td>
                              <td className="kp-summary-text">
                                <InlineText value={cat.summary} placeholder="ringkasan..." onSave={(v) => onUpdateCategory(cat.id, s.id, { summary: v })} />
                              </td>
                              <td className="right bold mono">{toRupiah(catTotal)}</td>
                              <td className="right" style={{ color: "#64748b", fontSize: "0.72rem" }}>{pct}%</td>
                              <td className="center">
                                <button onClick={() => onDeleteCategory(cat.id, s.id)} className="kp-btn--icon delete" title="Hapus kategori"><Trash2 size={13} /></button>
                              </td>
                            </tr>

                            {isOpenC && (
                              <tr key={`${cat.id}-d`} className="kp-detail-panel">
                                <td colSpan={5}>
                                  <div className="kp-detail-inner" style={{ margin: "10px 12px", padding: "12px" }}>
                                    <div className="kp-detail-header" style={{ marginBottom: 12 }}>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="kp-detail-label" style={{ fontSize: "0.6rem" }}>Detail {cat.name}</div>
                                        <InlineText value={cat.description} placeholder="Deskripsi kategori..." onSave={(v) => onUpdateCategory(cat.id, s.id, { description: v })} />
                                      </div>
                                      <div className="kp-detail-total-box" style={{ padding: "6px 10px" }}>
                                        <div className="kp-detail-total-label" style={{ fontSize: "0.55rem" }}>Total</div>
                                        <div className="kp-detail-total-value" style={{ fontSize: "0.8rem" }}>{toRupiah(catTotal)}</div>
                                      </div>
                                    </div>

                                    <div style={{ overflowX: "auto" }}>
                                      <table className="kp-sub-table">
                                        <thead>
                                          <tr>
                                            <th>Item &amp; Rincian Rencana</th>
                                            <th className="right" style={{ width: 100 }}>Subtotal</th>
                                            <th className="right" style={{ width: 120 }}>Terbayar</th>
                                            <th className="right" style={{ width: 50 }}>Aksi</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(cat.items ?? []).length === 0 && (
                                            <tr><td colSpan={4} style={{ textAlign: "center", padding: 16, color: "#cbd5e1" }}>Belum ada item.</td></tr>
                                          )}
                                          {(cat.items ?? []).map((item) => {
                                            const sub = itemSubtotal(item);
                                            const spent = transactionMap[item.id] || 0;
                                            const isFullyPaid = spent >= sub && sub > 0;
                                            
                                            return (
                                              <tr key={item.id}>
                                                <td>
                                                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                                                    <InlineText value={item.name} placeholder="Nama item" onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { name: v })} />
                                                  </div>
                                                  
                                                  {/* Compact Mobile-friendly row for Qty, Trips, Cost and Notes */}
                                                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px", fontSize: "0.68rem", color: "#64748b", marginTop: 4 }}>
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>
                                                      <InlineNumber value={item.qty} onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { qty: v })} />
                                                      <span>×</span>
                                                      <InlineNumber value={item.trips} onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { trips: v })} />
                                                      <span>×</span>
                                                      <span style={{ fontFamily: "JetBrains Mono" }}>{toRupiah(item.unit_cost)}</span>
                                                      <span>/</span>
                                                      <InlineText value={item.unit} placeholder="bulan" onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { unit: v })} />
                                                    </span>
                                                    <span style={{ color: "#94a3b8" }}>|</span>
                                                    <InlineText value={item.note} placeholder="tambah catatan..." onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { note: v })} />
                                                  </div>
                                                </td>
                                                <td className="right mono" style={{ fontWeight: 700, color: "#1e293b" }}>
                                                  {toRupiah(sub)}
                                                </td>
                                                <td className="right">
                                                  {/* Interactive Terbayar Pill */}
                                                  <button
                                                    onClick={() => onOpenTransactions(item, "living_cost")}
                                                    className={`kp-pill ${isFullyPaid ? "kp-pill--emerald" : spent > 0 ? "kp-pill--amber" : "kp-pill--rose"}`}
                                                    style={{ borderStyle: "solid", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px" }}
                                                  >
                                                    <Plus size={10} strokeWidth={3} />
                                                    <span style={{ fontFamily: "JetBrains Mono" }}>{toRupiah(spent)}</span>
                                                  </button>
                                                </td>
                                                <td className="right">
                                                  <button onClick={() => onDeleteItem(item.id, cat.id, s.id)} className="kp-btn--icon delete" style={{ width: 28, height: 28 }} title="Hapus item">
                                                    <Trash2 size={12} />
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>

                                    <button onClick={() => onAddItem(cat.id, s.id)} className="kp-btn kp-btn--dark kp-btn--sm" style={{ marginTop: 12 }}>
                                      <Plus size={13} /> Tambah item
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                    {cats.length > 0 && (
                      <tfoot>
                        <tr>
                          <td colSpan={2} className="label">Total Living Cost</td>
                          <td className="right">{toRupiah(totalLC)}</td>
                          <td className="right" style={{ color: "#64748b", fontSize: "0.72rem" }}>100%</td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Add Category */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                  <button onClick={() => onAddCategory(s.id, s.user_id)} className="kp-btn kp-btn--dark kp-btn--sm">
                    <Plus size={13} /> Tambah Kategori
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
