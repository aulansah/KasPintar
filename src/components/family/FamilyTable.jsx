import { useState, useRef } from "react";
import { Check, X } from "lucide-react";
import { toRupiah, parseRupiah } from "../../utils/format";

function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef(null);

  function start() { setDraft(String(Math.round(value || 0))); setEditing(true); setTimeout(() => ref.current?.select(), 0); }
  function save()  { onSave(parseRupiah(draft)); setEditing(false); }

  if (editing) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <input ref={ref} type="text" value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="kp-inline-input" style={{ width: 120, textAlign: "right" }}
      />
      <button onClick={save} style={{ color: "#10b981", background: "none", border: "none", cursor: "pointer" }}><Check size={12} /></button>
      <button onClick={() => setEditing(false)} style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}><X size={12} /></button>
    </span>
  );

  return (
    <span onClick={start} title="Klik untuk edit" className="kp-editable">{toRupiah(value)}</span>
  );
}

export default function FamilyTable({ summaries = [], familyMap = {}, onUpdate }) {
  const totals = summaries.reduce((acc, s) => {
    const fam = familyMap[s.id];
    const ortu = Number(fam?.ortu || 0);
    const adik = Number(fam?.adik || 0);
    const takterduga = Number(fam?.tak_terduga || 0);
    return {
      ortu: acc.ortu + ortu,
      adik: acc.adik + adik,
      takterduga: acc.takterduga + takterduga,
      total: acc.total + ortu + adik + takterduga,
    };
  }, { ortu: 0, adik: 0, takterduga: 0, total: 0 });

  return (
    <div className="kp-card">
      <div className="kp-card__header">
        <div>
          <div className="kp-card__title">Rincian Pengeluaran Keluarga</div>
          <div className="kp-card__subtitle">Klik nominal untuk edit langsung. Perubahan otomatis tersinkron ke Summary Month.</div>
        </div>
        <span className="kp-badge">Bisa Diedit</span>
      </div>

      <div className="kp-table-wrap">
        <table className="kp-table">
          <thead>
            <tr>
              <th className="center">Bulan</th>
              <th className="right">Orang Tua</th>
              <th className="right">Adik</th>
              <th className="right">Biaya Tak Terduga</th>
              <th className="right bg-light">Total Keluarga</th>
            </tr>
          </thead>
          <tbody>
            {summaries.length === 0 && (
              <tr><td colSpan={5} className="kp-empty">Belum ada data bulan. Tambahkan bulan di tab Summary Month.</td></tr>
            )}
            {summaries.map((s) => {
              const fam = familyMap[s.id];
              const ortu = Number(fam?.ortu || 0);
              const adik = Number(fam?.adik || 0);
              const takterduga = Number(fam?.tak_terduga || 0);
              const total = ortu + adik + takterduga;

              return (
                <tr key={s.id}>
                  <td className="center bold">{s.bulan} {s.tahun}</td>
                  <td className="right"><EditableCell value={ortu} onSave={(v) => onUpdate(s.id, s.user_id, { ortu: v })} /></td>
                  <td className="right"><EditableCell value={adik} onSave={(v) => onUpdate(s.id, s.user_id, { adik: v })} /></td>
                  <td className="right"><EditableCell value={takterduga} onSave={(v) => onUpdate(s.id, s.user_id, { tak_terduga: v })} /></td>
                  <td className="right indigo bold mono bg-light">{toRupiah(total)}</td>
                </tr>
              );
            })}
          </tbody>
          {summaries.length > 0 && (
            <tfoot>
              <tr>
                <td className="label center">TOTAL</td>
                <td className="right">{toRupiah(totals.ortu)}</td>
                <td className="right">{toRupiah(totals.adik)}</td>
                <td className="right">{toRupiah(totals.takterduga)}</td>
                <td className="right indigo">{toRupiah(totals.total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
