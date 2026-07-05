import { TrendingUp, TrendingDown, PiggyBank, HeartPulse } from "lucide-react";
import { toRupiah } from "../../utils/format";
import { calculateFinancialStatus } from "../../utils/calculate";

export default function WidgetCards({ sums, negativeMonths, periodLabel }) {
  const { income = 0, expense = 0, surplus = 0 } = sums || {};
  const savingRate = income > 0 ? ((surplus / income) * 100).toFixed(1) : "0.0";
  const status = calculateFinancialStatus({ income, expense, surplus }, negativeMonths ?? []);

  return (
    <div className="kp-widgets">

      {/* Total Pendapatan */}
      <div className="kp-widget">
        <div>
          <div className="kp-widget__label">Total Pendapatan</div>
          <div className="kp-widget__value kp-widget__value--blue">{toRupiah(income)}</div>
          <span className="kp-widget__sub">{periodLabel || "Semua bulan"}</span>
        </div>
        <div className="kp-widget__icon kp-widget__icon--blue">
          <TrendingUp size={22} />
        </div>
      </div>

      {/* Total Pengeluaran */}
      <div className="kp-widget">
        <div>
          <div className="kp-widget__label">Total Pengeluaran</div>
          <div className="kp-widget__value kp-widget__value--rose">{toRupiah(expense)}</div>
          <span className="kp-widget__sub">{periodLabel || "Semua bulan"}</span>
        </div>
        <div className="kp-widget__icon kp-widget__icon--rose">
          <TrendingDown size={22} />
        </div>
      </div>

      {/* Sisa Tabungan */}
      <div className="kp-widget">
        <div>
          <div className="kp-widget__label">Sisa Tabungan Bersih</div>
          <div className={`kp-widget__value kp-widget__value--${status.tone === "emerald" ? "emerald" : status.tone === "amber" ? "amber" : "rose"}`}>
            {toRupiah(surplus)}
          </div>
          <span className={`kp-widget__sub kp-widget__sub--${status.tone === "emerald" ? "emerald" : status.tone === "amber" ? "amber" : "rose"}`}>
            Saving Rate: {savingRate}%
          </span>
        </div>
        <div className="kp-widget__icon kp-widget__icon--emerald">
          <PiggyBank size={22} />
        </div>
      </div>

      {/* Kondisi Finansial */}
      <div className="kp-widget">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kp-widget__label">Kondisi Finansial</div>
          <div className="kp-widget__status-title">
            <span className={`kp-status-dot kp-status-dot--${status.tone}`} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {status.label}
            </span>
          </div>
          <div className="kp-widget__status-note">{status.note}</div>
        </div>
        <div className={`kp-widget__icon kp-widget__icon--${status.tone === "emerald" ? "emerald" : status.tone === "amber" ? "amber" : "rose"}`} style={{ marginLeft: 12 }}>
          <HeartPulse size={22} />
        </div>
      </div>

    </div>
  );
}
