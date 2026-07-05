import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toRupiah, parseRupiah } from "../../utils/format";

function EditableCell({ value, onSave, colorClass = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  function start() {
    setDraft(String(Math.round(value || 0)));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function save() {
    onSave(parseRupiah(draft));
    setEditing(false);
  }

  if (editing) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          className="kp-inline-input"
          style={{ width: 130, textAlign: "right" }}
        />
        <button onClick={save} style={{ color: "#10b981", background: "none", border: "none", cursor: "pointer" }}><Check size={13} /></button>
        <button onClick={() => setEditing(false)} style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}><X size={13} /></button>
      </span>
    );
  }

  return (
    <span
      onClick={start}
      title="Klik untuk edit"
      className={`kp-editable ${colorClass}`}
    >
      {toRupiah(value)}
    </span>
  );
}

export default function SummaryMonthTable({ data = [], onAdd, onEdit, onDelete, onFieldSave }) {
  const totals = data.reduce((acc, row) => {
    const income = Number(row.income || 0);
    const cicilan = Number(row.cicilan || 0);
    const kontrakan = Number(row.kontrakan || 0);
    const arisan = Number(row.arisan || 0);
    const living = Number(row.living_cost || 0);
    const keluarga = Number(row.keluarga || 0);
    const expense = cicilan + kontrakan + arisan + living + keluarga;
    return {
      income: acc.income + income,
      cicilan: acc.cicilan + cicilan,
      kontrakan: acc.kontrakan + kontrakan,
      arisan: acc.arisan + arisan,
      living: acc.living + living,
      keluarga: acc.keluarga + keluarga,
      expense: acc.expense + expense,
      surplus: acc.surplus + (income - expense),
    };
  }, { income: 0, cicilan: 0, kontrakan: 0, arisan: 0, living: 0, keluarga: 0, expense: 0, surplus: 0 });

  return (
    <div className="kp-card">
      <div className="kp-card__header">
        <div>
          <div className="kp-card__title">Summary Month</div>
          <div className="kp-card__subtitle">Klik nominal Income, Kontrakan, Arisan untuk edit langsung. Cicilan &amp; Living Cost otomatis terhubung ke tab detail.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="kp-badge">Bisa Diedit</span>
          <button onClick={onAdd} className="kp-btn kp-btn--primary kp-btn--sm">
            <Plus size={14} />
            Tambah Bulan
          </button>
        </div>
      </div>

      <div className="kp-table-wrap">
        <table className="kp-table">
          <thead>
            <tr>
              <th className="center">Bulan</th>
              <th className="right">Gaji / Income</th>
              <th className="right">Cicilan</th>
              <th className="right">Kontrakan</th>
              <th className="right">Arisan</th>
              <th className="right">Living Cost</th>
              <th className="right">Keluarga</th>
              <th className="right bg-light">Total Pengeluaran</th>
              <th className="right bg-green">Sisa / Surplus</th>
              <th className="center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={10} className="kp-empty">
                  Belum ada data. Klik "Tambah Bulan" untuk memulai.
                </td>
              </tr>
            )}
            {data.map((row) => {
              const income = Number(row.income || 0);
              const cicilan = Number(row.cicilan || 0);
              const kontrakan = Number(row.kontrakan || 0);
              const arisan = Number(row.arisan || 0);
              const living = Number(row.living_cost || 0);
              const keluarga = Number(row.keluarga || 0);
              const expense = cicilan + kontrakan + arisan + living + keluarga;
              const surplus = income - expense;

              return (
                <tr key={row.id}>
                  <td className="center bold">{row.bulan} {row.tahun}</td>
                  <td className="right">
                    <EditableCell value={income} onSave={(v) => onFieldSave(row.id, "income", v)} colorClass="blue" />
                  </td>
                  <td className="right mono">{toRupiah(cicilan)}</td>
                  <td className="right">
                    <EditableCell value={kontrakan} onSave={(v) => onFieldSave(row.id, "kontrakan", v)} />
                  </td>
                  <td className="right">
                    <EditableCell value={arisan} onSave={(v) => onFieldSave(row.id, "arisan", v)} />
                  </td>
                  <td className="right mono">{toRupiah(living)}</td>
                  <td className="right mono">{toRupiah(keluarga)}</td>
                  <td className="right bold mono bg-light">{toRupiah(expense)}</td>
                  <td className={`right bold mono bg-green ${surplus >= 0 ? "green" : "rose"}`}>{toRupiah(surplus)}</td>
                  <td className="center">
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                      <button onClick={() => onEdit(row)} className="kp-btn--icon edit" title="Edit bulan/tahun">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => onDelete(row.id)} className="kp-btn--icon delete" title="Hapus">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr>
                <td className="label center">TOTAL</td>
                <td className="right blue">{toRupiah(totals.income)}</td>
                <td className="right">{toRupiah(totals.cicilan)}</td>
                <td className="right">{toRupiah(totals.kontrakan)}</td>
                <td className="right">{toRupiah(totals.arisan)}</td>
                <td className="right">{toRupiah(totals.living)}</td>
                <td className="right">{toRupiah(totals.keluarga)}</td>
                <td className="right">{toRupiah(totals.expense)}</td>
                <td className={`right ${totals.surplus >= 0 ? "green" : "rose"}`} style={{ fontSize: "1rem" }}>{toRupiah(totals.surplus)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
