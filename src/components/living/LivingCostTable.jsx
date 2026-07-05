import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
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
      className="kp-inline-input" style={{ width: "100%", minWidth: 100 }}
    />
  );
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} className="kp-editable">
      {value || <span style={{ color: "#cbd5e1", fontFamily: "inherit" }}>{placeholder}</span>}
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
      className="kp-inline-input" style={{ width: 90, textAlign: "right", ...st }}
    />
  );
  return (
    <span onClick={() => { setDraft(String(value || 0)); setEditing(true); }} className="kp-editable" style={{ display: "inline-block", textAlign: "right" }}>
      {value}
    </span>
  );
}

export default function LivingCostTable({
  summaries = [], livingMap = {},
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddItem, onUpdateItem, onDeleteItem,
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
            <div className="kp-card__header" style={{ cursor: "pointer" }} onClick={() => toggleSummary(s.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isOpenS
                  ? <ChevronDown size={16} className="kp-expand-icon kp-expand-icon--open" />
                  : <ChevronRight size={16} className="kp-expand-icon" />
                }
                <div>
                  <div className="kp-card__title">Living Cost — {s.bulan} {s.tahun}</div>
                  <div className="kp-card__subtitle">
                    {cats.length} kategori · Total: <strong style={{ color: "#059669" }}>{toRupiah(totalLC)}</strong>
                  </div>
                </div>
              </div>
              <span className="kp-badge kp-badge--green">Detail bisa diedit</span>
            </div>

            {isOpenS && (
              <>
                <div className="kp-table-wrap">
                  <table className="kp-table">
                    <thead>
                      <tr>
                        <th>Kategori Pengeluaran</th>
                        <th>Ringkasan</th>
                        <th className="right">Anggaran Bulanan</th>
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
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                  <span onClick={() => toggleCategory(cat.id)} style={{ cursor: "pointer" }}>
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
                              <td className="right" style={{ color: "#64748b", fontSize: "0.75rem" }}>{pct}%</td>
                              <td className="center">
                                <button onClick={() => onDeleteCategory(cat.id, s.id)} className="kp-btn--icon delete" title="Hapus kategori"><Trash2 size={13} /></button>
                              </td>
                            </tr>

                            {isOpenC && (
                              <tr key={`${cat.id}-d`} className="kp-detail-panel">
                                <td colSpan={5}>
                                  <div className="kp-detail-inner">
                                    <div className="kp-detail-header">
                                      <div>
                                        <div className="kp-detail-label">Detail {cat.name}</div>
                                        <InlineText value={cat.description} placeholder="Deskripsi kategori..." onSave={(v) => onUpdateCategory(cat.id, s.id, { description: v })} />
                                      </div>
                                      <div className="kp-detail-total-box">
                                        <div className="kp-detail-total-label">Total</div>
                                        <div className="kp-detail-total-value">{toRupiah(catTotal)}</div>
                                      </div>
                                    </div>

                                    <div style={{ overflowX: "auto" }}>
                                      <table className="kp-sub-table" style={{ width: "100%" }}>
                                        <thead>
                                          <tr>
                                            <th style={{ minWidth: 130 }}>Item</th>
                                            <th style={{ minWidth: 110 }}>Catatan</th>
                                            <th className="right" style={{ width: 60 }}>Qty</th>
                                            <th className="right" style={{ width: 60 }}>Freq</th>
                                            <th style={{ width: 70 }}>Satuan</th>
                                            <th className="right" style={{ width: 120 }}>Biaya Satuan</th>
                                            <th className="right" style={{ width: 120 }}>Subtotal</th>
                                            <th className="right">Aksi</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(cat.items ?? []).length === 0 && (
                                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 16, color: "#cbd5e1" }}>Belum ada item.</td></tr>
                                          )}
                                          {(cat.items ?? []).map((item) => {
                                            const sub = itemSubtotal(item);
                                            return (
                                              <tr key={item.id}>
                                                <td><InlineText value={item.name} placeholder="Nama item" onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { name: v })} /></td>
                                                <td style={{ color: "#94a3b8" }}><InlineText value={item.note} placeholder="catatan..." onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { note: v })} /></td>
                                                <td className="right"><InlineNumber value={item.qty} onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { qty: v })} /></td>
                                                <td className="right"><InlineNumber value={item.trips} onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { trips: v })} /></td>
                                                <td><InlineText value={item.unit} placeholder="bulan" onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { unit: v })} /></td>
                                                <td className="right"><InlineNumber value={item.unit_cost} onSave={(v) => onUpdateItem(item.id, cat.id, s.id, { unit_cost: v })} /></td>
                                                <td className="right mono" style={{ fontWeight: 700, color: "#1e293b" }}>{toRupiah(sub)}</td>
                                                <td className="right">
                                                  <button onClick={() => onDeleteItem(item.id, cat.id, s.id)} className="kp-btn--icon delete" title="Hapus item"><Trash2 size={12} /></button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>

                                    <button onClick={() => onAddItem(cat.id, s.id)} className="kp-btn kp-btn--dark kp-btn--sm" style={{ marginTop: 14 }}>
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
                          <td className="right" style={{ color: "#64748b", fontSize: "0.75rem" }}>100%</td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Add Category */}
                <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
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
