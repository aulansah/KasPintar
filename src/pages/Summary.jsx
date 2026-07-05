import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";

import {
  getSummary,
  createSummary,
  updateSummary,
  deleteSummary,
} from "../services/summaryService";

export default function Summary() {
  const { user } = useAuth();

  const [summary, setSummary] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    bulan: "",
    tahun: new Date().getFullYear(),
    income: "",
    kontrakan: "",
    arisan: "",
  });

  const loadSummary = useCallback(async () => {
    if (!user) return;

    try {
      const data = await getSummary(user.id);
      setSummary(data ?? []);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      user_id: user.id,
      bulan: form.bulan,
      tahun: Number(form.tahun),
      income: Number(form.income),
      kontrakan: Number(form.kontrakan),
      arisan: Number(form.arisan),
    };

    try {
      if (editingId) {
        await updateSummary(editingId, payload);
      } else {
        await createSummary(payload);
      }

      setEditingId(null);

      setForm({
        bulan: "",
        tahun: new Date().getFullYear(),
        income: "",
        kontrakan: "",
        arisan: "",
      });

      loadSummary();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);

    setForm({
      bulan: item.bulan,
      tahun: item.tahun,
      income: item.income,
      kontrakan: item.kontrakan,
      arisan: item.arisan,
    });
  }

  async function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;

    try {
      await deleteSummary(id);
      loadSummary();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">

        <h1 className="text-3xl font-bold mb-8">
          Summary Month
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 mb-8 grid grid-cols-2 gap-4"
        >

          <input
            name="bulan"
            value={form.bulan}
            onChange={handleChange}
            placeholder="Bulan"
            className="border rounded-xl p-3"
            required
          />

          <input
            name="tahun"
            type="number"
            value={form.tahun}
            onChange={handleChange}
            placeholder="Tahun"
            className="border rounded-xl p-3"
            required
          />

          <input
            name="income"
            type="number"
            value={form.income}
            onChange={handleChange}
            placeholder="Income"
            className="border rounded-xl p-3"
          />

          <input
            name="kontrakan"
            type="number"
            value={form.kontrakan}
            onChange={handleChange}
            placeholder="Kontrakan"
            className="border rounded-xl p-3"
          />

          <input
            name="arisan"
            type="number"
            value={form.arisan}
            onChange={handleChange}
            placeholder="Arisan"
            className="border rounded-xl p-3"
          />

          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
          >
            {editingId ? "Update" : "Simpan"}
          </button>

        </form>

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">Bulan</th>
                <th>Tahun</th>
                <th>Income</th>
                <th>Kontrakan</th>
                <th>Arisan</th>
                <th>Aksi</th>

              </tr>

            </thead>

            <tbody>

              {summary.map((item) => (

                <tr key={item.id} className="border-t">

                  <td className="p-4">{item.bulan}</td>

                  <td>{item.tahun}</td>

                  <td>
                    Rp {Number(item.income).toLocaleString("id-ID")}
                  </td>

                  <td>
                    Rp {Number(item.kontrakan).toLocaleString("id-ID")}
                  </td>

                  <td>
                    Rp {Number(item.arisan).toLocaleString("id-ID")}
                  </td>

                  <td>

                    <div className="flex gap-2 justify-center">

                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        Hapus
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </DashboardLayout>
  );
}