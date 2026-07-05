import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toRupiah, parseRupiah } from "../../utils/format";
import { debtMonthTotal, debtSummaryText } from "../../utils/calculate";

function InlineText({ value, onSave, placeholder = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    if (draft !== value) onSave(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <input autoFocus type="text" value={draft} placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="kp-inline-input" style={{ width: "100%", minWidth: 120 }}
      />
    );
  }
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} className="kp-editable">
      {value || <span style={{ color: "#cbd5e1", fontFamily: "inherit" }}>{placeholder}</span>}
    </span>
  );
}

function InlineNumber({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    onSave(parseRupiah(draft));
    setEditing(false);
  }

  if (editing) {
    return (
      <input autoFocus type="text" value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="kp-inline-input" style={{ width: 130, textAlign: "right" }}
      />
    );
  }
  return (
    <span onClick={() => { setDraft(String(value || 0)); setEditing(true); }} className="kp-editable">
      {toRupiah(value)}
    </span>
  );
}

export default function CicilanTable({ summaries = [], debtMap = {}, onAddItem, onUpdateItem, onDeleteItem }) {
  const [openMonth, setOpenMonth] = useState(null);

  function toggle(id) { setOpenMonth((p) => (p === id ? null : id)); }

  const grandTotal = summaries.reduce((sum, s) => sum + debtMonthTotal(debtMap[s.id] ?? []), 0);

  return (
    <div className="kp-card">
      <div className="kp-card__header">
        <div>
          <div className="kp-card__title">Rincian Cicilan / Pinjaman</div>
          <div className="kp-card__subtitle">Klik baris bulan untuk membuka detail. Perubahan otomatis tersinkron ke Summary Month.</div>
        </div>
        <span className="kp-badge kp-badge--green">Detail bisa diedit</span>
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
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {isOpen
                          ? <ChevronDown size={14} className="kp-expand-icon kp-expand-icon--open" />
                          : <ChevronRight size={14} className="kp-expand-icon" />
                        }
                        <span className="kp-month-label">{s.bulan} {s.tahun}</span>
                      </span>
                    </td>
                    <td className="kp-summary-text">{debtSummaryText(items)}</td>
                    <td className="right bold mono">{toRupiah(monthTotal)}</td>
                  </tr>

                  {isOpen && (
                    <tr key={`${s.id}-d`} className="kp-detail-panel">
                      <td colSpan={3}>
                        <div className="kp-detail-inner">
                          <div className="kp-detail-header">
                            <div>
                              <div className="kp-detail-label">Detail Cicilan {s.bulan} {s.tahun}</div>
                              <div className="kp-detail-desc">Pecah cicilan / pinjaman menjadi beberapa item. Total otomatis masuk ke Summary Month.</div>
                            </div>
                            <div className="kp-detail-total-box">
                              <div className="kp-detail-total-label">Total</div>
                              <div className="kp-detail-total-value">{toRupiah(monthTotal)}</div>
                            </div>
                          </div>

                          <div style={{ overflowX: "auto" }}>
                            <table className="kp-sub-table" style={{ width: "100%" }}>
                              <thead>
                                <tr>
                                  <th style={{ minWidth: 160 }}>Nama Cicilan</th>
                                  <th style={{ minWidth: 160 }}>Catatan</th>
                                  <th className="right" style={{ minWidth: 140 }}>Nominal</th>
                                  <th className="right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.length === 0 && (
                                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "16px 0", color: "#cbd5e1" }}>Belum ada item.</td></tr>
                                )}
                                {items.map((item) => (
                                  <tr key={item.id}>
                                    <td><InlineText value={item.name} placeholder="Nama cicilan" onSave={(v) => onUpdateItem(item.id, s.id, { name: v })} /></td>
                                    <td style={{ color: "#94a3b8" }}><InlineText value={item.note} placeholder="catatan..." onSave={(v) => onUpdateItem(item.id, s.id, { note: v })} /></td>
                                    <td className="right"><InlineNumber value={item.amount} onSave={(v) => onUpdateItem(item.id, s.id, { amount: v })} /></td>
                                    <td className="right">
                                      <button onClick={() => onDeleteItem(item.id, s.id)} className="kp-btn--icon delete" title="Hapus"><Trash2 size={13} /></button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <button onClick={() => onAddItem(s.id, s.user_id)} className="kp-btn kp-btn--dark kp-btn--sm" style={{ marginTop: 14 }}>
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
