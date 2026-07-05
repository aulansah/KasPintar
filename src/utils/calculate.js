/**
 * Hitung subtotal satu item living cost
 * @param {{qty: number, trips: number, unit_cost: number}} item
 * @returns {number}
 */
export function itemSubtotal(item) {
  return (
    (parseFloat(item.qty) || 0) *
    (parseFloat(item.trips) || 0) *
    (parseFloat(item.unit_cost) || 0)
  );
}

/**
 * Hitung total satu kategori living cost
 * @param {{items: Array}} category
 * @returns {number}
 */
export function categoryAmount(category) {
  return (category.items ?? []).reduce(
    (sum, item) => sum + itemSubtotal(item),
    0
  );
}

/**
 * Hitung total semua kategori living cost
 * @param {Array} categories
 * @returns {number}
 */
export function totalLivingCost(categories) {
  return (categories ?? []).reduce(
    (sum, cat) => sum + categoryAmount(cat),
    0
  );
}

/**
 * Tentukan status finansial berdasarkan total dan bulan defisit
 * @param {{income: number, expense: number, surplus: number}} sums
 * @param {string[]} negativeMonths
 * @returns {{label: string, note: string, tone: 'emerald'|'amber'|'rose', headerText: string}}
 */
export function calculateFinancialStatus(sums, negativeMonths) {
  const savingRate =
    sums.income > 0 ? (sums.surplus / sums.income) * 100 : 0;
  const hasDeficitMonth = negativeMonths.length > 0;
  const isOverallDeficit = sums.surplus < 0;

  if (isOverallDeficit) {
    return {
      label: "DEFISIT TOTAL",
      note: `Total pengeluaran melebihi pendapatan. Bulan defisit: ${negativeMonths.join(", ") || "-"}.`,
      tone: "rose",
      headerText: "Cashflow Defisit",
    };
  }

  if (hasDeficitMonth) {
    return {
      label: "ADA BULAN DEFISIT",
      note: `Surplus total masih positif, tapi bulan ${negativeMonths.join(", ")} perlu dikoreksi.`,
      tone: "amber",
      headerText: "Perlu Dipantau",
    };
  }

  if (savingRate < 10) {
    return {
      label: "SURPLUS TIPIS",
      note: `Semua bulan positif, tapi saving rate hanya ${Math.round(savingRate)}%. Perlu ruang aman lebih besar.`,
      tone: "amber",
      headerText: "Perlu Dipantau",
    };
  }

  return {
    label: "STABIL & SURPLUS",
    note: "Semua bulan memiliki sisa anggaran positif.",
    tone: "emerald",
    headerText: "Sistem Keuangan Sehat",
  };
}

/**
 * Hitung total cicilan satu bulan dari debt_items
 * @param {Array} items
 * @returns {number}
 */
export function debtMonthTotal(items) {
  return (items ?? []).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
}

/**
 * Buat ringkasan singkat dari daftar cicilan
 * @param {Array} items
 * @returns {string}
 */
export function debtSummaryText(items) {
  const active = (items ?? []).filter(
    (item) => (parseFloat(item.amount) || 0) !== 0
  );
  if (active.length === 0) return "Tidak ada cicilan";
  if (active.length === 1) return active[0].name;
  return active.map((i) => i.name).join(" + ");
}
