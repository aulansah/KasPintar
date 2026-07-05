import { Pencil, Trash2 } from "lucide-react";

const rupiah = (value) =>
  Number(value || 0).toLocaleString("id-ID");

export default function SummaryTable({
  data = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="px-6 py-5 border-b border-slate-100">

        <h2 className="text-xl font-bold text-slate-800">
          Summary Month
        </h2>

        <p className="text-sm text-emerald-500 mt-0.5">
          Ringkasan Cashflow Bulanan
        </p>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead>

            <tr className="border-b border-slate-100">

              <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bulan
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Income
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cicilan
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kontrakan
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Arisan
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Living
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Family
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Expense
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cashflow
              </th>

              <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {data.length === 0 && (

              <tr>

                <td
                  colSpan="10"
                  className="text-center py-16 text-slate-400"
                >
                  Belum ada data.
                </td>

              </tr>

            )}

            {data.map((item) => {

              const expense =
                Number(item.cicilan || 0) +
                Number(item.kontrakan || 0) +
                Number(item.arisan || 0) +
                Number(item.living_cost || 0) +
                Number(item.keluarga || 0);

              const cashflow =
                Number(item.income || 0) - expense;

              return (

                <tr
                  key={item.id}
                  className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
                >

                  <td className="px-5 py-4 font-semibold text-slate-800">

                    {item.bulan}

                  </td>

                  <td className="px-5 py-4 text-center text-emerald-600 font-medium">

                    Rp {rupiah(item.income)}

                  </td>

                  <td className="px-5 py-4 text-center text-slate-600">

                    Rp {rupiah(item.cicilan)}

                  </td>

                  <td className="px-5 py-4 text-center text-slate-600">

                    Rp {rupiah(item.kontrakan)}

                  </td>

                  <td className="px-5 py-4 text-center text-slate-600">

                    Rp {rupiah(item.arisan)}

                  </td>

                  <td className="px-5 py-4 text-center text-slate-600">

                    Rp {rupiah(item.living_cost)}

                  </td>

                  <td className="px-5 py-4 text-center text-slate-600">

                    Rp {rupiah(item.keluarga)}

                  </td>

                  <td className="px-5 py-4 text-center font-semibold text-red-500">

                    Rp {rupiah(expense)}

                  </td>

                  <td
                    className={`px-5 py-4 text-center font-bold ${
                      cashflow >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >

                    Rp {rupiah(cashflow)}

                  </td>

                  <td className="px-5 py-4">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => onEdit(item)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
                      >

                        <Pencil size={15} />

                      </button>

                      <button
                        onClick={() => onDelete(item.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                      >

                        <Trash2 size={15} />

                      </button>

                    </div>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}