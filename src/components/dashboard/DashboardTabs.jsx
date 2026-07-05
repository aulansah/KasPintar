import { TableProperties, CreditCard, Utensils, Users, PieChart } from "lucide-react";

const TABS = [
  { id: "summary",  label: "Summary Month",      Icon: TableProperties },
  { id: "cicilan",  label: "Rincian Cicilan",     Icon: CreditCard },
  { id: "living",   label: "Rincian Living Cost", Icon: Utensils },
  { id: "keluarga", label: "Rincian Keluarga",    Icon: Users },
  { id: "charts",   label: "Visualisasi Grafik",  Icon: PieChart },
];

export default function DashboardTabs({ activeTab, setActiveTab }) {
  return (
    <div className="kp-tabs">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`kp-tab${activeTab === id ? " kp-tab--active" : ""}`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}