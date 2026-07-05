import { Download, Wallet } from "lucide-react";
import { calculateFinancialStatus } from "../utils/calculate";

export default function Header({ sums, negativeMonths, onExport }) {
  const status = sums
    ? calculateFinancialStatus(sums, negativeMonths ?? [])
    : { tone: "emerald", headerText: "Sistem Keuangan Sehat" };

  return (
    <header className="kp-header">
      <div className="kp-header__inner">
        <div className="kp-header__brand">
          <div className="kp-header__logo">
            <Wallet size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="kp-header__title">KAS PINTAR</div>
            <div className="kp-header__sub">Aesthetic Personal Cashflow System</div>
          </div>
        </div>

        <div className="kp-header__right">
          <span className={`kp-pill kp-pill--${status.tone}`}>
            <span className="kp-pill__dot anim-pulse" />
            {status.headerText}
          </span>
          <button onClick={onExport} className="kp-btn-export">
            <Download size={15} />
            Ekspor ke CSV
          </button>
        </div>
      </div>
    </header>
  );
}