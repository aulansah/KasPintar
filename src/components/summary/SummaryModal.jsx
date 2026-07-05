import { useEffect, useState } from "react";
import { X } from "lucide-react";

const MONTHS_ID = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

export default function SummaryModal({ open, editingData, onClose, onSave }) {
  const [form, setForm] = useState({ bulan: "Januari", tahun: new Date().getFullYear() });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingData) {
      setForm({ bulan: editingData.bulan ?? "Januari", tahun: editingData.tahun ?? new Date().getFullYear() });
    } else {
      setForm({ bulan: "Januari", tahun: new Date().getFullYear() });
    }
  }, [editingData, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ bulan: form.bulan, tahun: Number(form.tahun) });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="kp-modal-overlay">
      <div className="kp-modal">
        <div className="kp-modal__header">
          <span className="kp-modal__title">{editingData ? "Edit Bulan" : "Tambah Bulan Baru"}</span>
          <button onClick={onClose} className="kp-btn--icon"><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kp-modal__body">
            <div className="kp-field">
              <label>Bulan</label>
              <select value={form.bulan} onChange={(e) => setForm((p) => ({ ...p, bulan: e.target.value }))}>
                {MONTHS_ID.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="kp-field">
              <label>Tahun</label>
              <input
                type="number"
                value={form.tahun}
                onChange={(e) => setForm((p) => ({ ...p, tahun: e.target.value }))}
                min="2020" max="2099" required
              />
            </div>
          </div>
          <div className="kp-modal__foot">
            <button type="button" onClick={onClose} className="kp-btn kp-btn--outline" style={{ flex: 1 }}>Batal</button>
            <button type="submit" disabled={saving} className="kp-btn kp-btn--primary" style={{ flex: 1, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}