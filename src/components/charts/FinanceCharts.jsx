import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { toRupiah } from "../../utils/format";
import { categoryAmount } from "../../utils/calculate";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

export default function FinanceCharts({ summaries = [], livingMap = {} }) {
  // ── Bar Chart data ─────────────────────────────────────────────────────
  const labels = summaries.map((s) => `${s.bulan.substring(0, 3)} ${s.tahun}`);
  const incomeData  = summaries.map((s) => Number(s.income || 0));
  const expenseData = summaries.map((s) =>
    Number(s.cicilan || 0) + Number(s.kontrakan || 0) +
    Number(s.arisan || 0) + Number(s.living_cost || 0) + Number(s.keluarga || 0)
  );
  const surplusData = summaries.map((_, i) => incomeData[i] - expenseData[i]);

  const barData = {
    labels,
    datasets: [
      { label: "Pendapatan",   data: incomeData,  backgroundColor: "rgba(59,130,246,0.75)",  borderColor: "rgba(59,130,246,1)",  borderWidth: 1, borderRadius: 6 },
      { label: "Pengeluaran",  data: expenseData, backgroundColor: "rgba(244,63,94,0.75)",   borderColor: "rgba(244,63,94,1)",   borderWidth: 1, borderRadius: 6 },
      { label: "Surplus",      data: surplusData, backgroundColor: "rgba(16,185,129,0.75)",  borderColor: "rgba(16,185,129,1)",  borderWidth: 1, borderRadius: 6 },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 11, family: "Plus Jakarta Sans" }, padding: 16 } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${toRupiah(ctx.raw)}` } },
    },
    scales: {
      y: {
        ticks: { callback: (val) => toRupiah(val), font: { size: 10, family: "JetBrains Mono" }, maxTicksLimit: 6 },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: {
        ticks: { font: { size: 10, family: "Plus Jakarta Sans" } },
        grid: { display: false },
      },
    },
  };

  // ── Doughnut Chart data ────────────────────────────────────────────────
  const allCats = {};
  summaries.forEach((s) => {
    (livingMap[s.id] ?? []).forEach((cat) => {
      const amt = categoryAmount(cat);
      if (!allCats[cat.name]) allCats[cat.name] = 0;
      allCats[cat.name] += amt;
    });
  });
  const catNames   = Object.keys(allCats);
  const catAmounts = catNames.map((n) => allCats[n]);

  const palette = [
    "#10b981","#3b82f6","#f43f5e","#f59e0b","#8b5cf6",
    "#06b6d4","#84cc16","#ec4899","#fb923c","#a78bfa",
    "#34d399","#60a5fa","#f97316","#c084fc","#22d3ee",
  ];

  const doughnutData = {
    labels: catNames,
    datasets: [{ data: catAmounts, backgroundColor: palette.slice(0, catNames.length), borderWidth: 2, borderColor: "#fff", hoverOffset: 8 }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { font: { size: 11, family: "Plus Jakarta Sans" }, boxWidth: 12, padding: 14 } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${toRupiah(ctx.raw)}` } },
    },
    cutout: "60%",
  };

  if (summaries.length === 0) {
    return (
      <div className="kp-card">
        <div className="kp-empty">Belum ada data untuk ditampilkan. Tambahkan bulan dan isi data di tab lainnya.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>

      {/* Bar Chart */}
      <div className="kp-card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="kp-card__title">Tren Keuangan Bulanan</div>
          <div className="kp-card__subtitle" style={{ marginTop: 4 }}>Perbandingan pendapatan, pengeluaran, dan surplus per bulan</div>
        </div>
        <div style={{ height: 300 }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="kp-card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="kp-card__title">Komposisi Living Cost</div>
          <div className="kp-card__subtitle" style={{ marginTop: 4 }}>Porsi setiap kategori living cost dari semua bulan</div>
        </div>
        <div style={{ height: 300 }}>
          {catNames.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "0.85rem" }}>
              Belum ada data living cost
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
