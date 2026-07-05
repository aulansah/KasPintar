import { toRupiah } from "../utils/format";
import { debtMonthTotal, categoryAmount } from "../utils/calculate";

/**
 * Export seluruh data dashboard ke file CSV dan trigger download
 * @param {Object} params
 * @param {Array} params.summaries - data monthly_summary
 * @param {Object} params.debtMap - { [summaryId]: debtItems[] }
 * @param {Object} params.livingMap - { [summaryId]: categories[] }
 * @param {Object} params.familyMap - { [summaryId]: familyItem }
 */
export function exportToCSV({ summaries, debtMap, livingMap, familyMap }) {
  const lines = [];

  // === Sheet 1: Summary Month ===
  lines.push("=== SUMMARY MONTH ===");
  lines.push(
    [
      "Bulan",
      "Tahun",
      "Income",
      "Cicilan",
      "Kontrakan",
      "Arisan",
      "Living Cost",
      "Keluarga",
      "Total Pengeluaran",
      "Sisa/Surplus",
    ].join(",")
  );

  let totalIncome = 0,
    totalExpense = 0,
    totalSurplus = 0;

  summaries.forEach((row) => {
    const income = Number(row.income || 0);
    const cicilan = Number(row.cicilan || 0);
    const kontrakan = Number(row.kontrakan || 0);
    const arisan = Number(row.arisan || 0);
    const living = Number(row.living_cost || 0);
    const keluarga = Number(row.keluarga || 0);
    const expense = cicilan + kontrakan + arisan + living + keluarga;
    const surplus = income - expense;

    totalIncome += income;
    totalExpense += expense;
    totalSurplus += surplus;

    lines.push(
      [
        row.bulan,
        row.tahun,
        income,
        cicilan,
        kontrakan,
        arisan,
        living,
        keluarga,
        expense,
        surplus,
      ].join(",")
    );
  });

  lines.push(
    ["TOTAL", "", totalIncome, "", "", "", "", "", totalExpense, totalSurplus].join(",")
  );

  // === Sheet 2: Rincian Cicilan ===
  lines.push("");
  lines.push("=== RINCIAN CICILAN ===");
  lines.push(["Bulan", "Tahun", "Nama Cicilan", "Nominal", "Catatan"].join(","));

  summaries.forEach((row) => {
    const items = debtMap[row.id] ?? [];
    if (items.length === 0) {
      lines.push([row.bulan, row.tahun, "Tidak ada cicilan", 0, ""].join(","));
    } else {
      items.forEach((item) => {
        lines.push(
          [
            row.bulan,
            row.tahun,
            `"${item.name}"`,
            item.amount,
            `"${item.note || ""}"`,
          ].join(",")
        );
      });
    }
  });

  // === Sheet 3: Rincian Living Cost ===
  lines.push("");
  lines.push("=== RINCIAN LIVING COST ===");
  lines.push(
    ["Bulan", "Tahun", "Kategori", "Item", "Qty", "Frekuensi", "Satuan", "Biaya Satuan", "Subtotal"].join(",")
  );

  summaries.forEach((row) => {
    const cats = livingMap[row.id] ?? [];
    if (cats.length === 0) {
      lines.push([row.bulan, row.tahun, "Belum ada data", "", "", "", "", "", 0].join(","));
    } else {
      cats.forEach((cat) => {
        (cat.items ?? []).forEach((item) => {
          const subtotal = (item.qty || 0) * (item.trips || 0) * (item.unit_cost || 0);
          lines.push(
            [
              row.bulan,
              row.tahun,
              `"${cat.name}"`,
              `"${item.name}"`,
              item.qty,
              item.trips,
              item.unit,
              item.unit_cost,
              subtotal,
            ].join(",")
          );
        });
      });
    }
  });

  // === Sheet 4: Rincian Keluarga ===
  lines.push("");
  lines.push("=== RINCIAN KELUARGA ===");
  lines.push(["Bulan", "Tahun", "Orang Tua", "Adik", "Tak Terduga", "Total"].join(","));

  summaries.forEach((row) => {
    const fam = familyMap[row.id];
    const ortu = Number(fam?.ortu || 0);
    const adik = Number(fam?.adik || 0);
    const takterduga = Number(fam?.tak_terduga || 0);
    const total = ortu + adik + takterduga;
    lines.push([row.bulan, row.tahun, ortu, adik, takterduga, total].join(","));
  });

  // Trigger download
  const csvContent = "\uFEFF" + lines.join("\n"); // BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kaspintar_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
