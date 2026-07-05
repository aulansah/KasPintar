import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  PiggyBank,
} from "lucide-react";

function Card({ title, value, color, icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-between items-center hover:shadow-md transition-shadow duration-300">

      <div>

        <p className="text-sm text-slate-500 font-medium">

          {title}

        </p>

        <h2 className={`text-3xl font-bold mt-2 ${color}`}>

          {value}

        </h2>

      </div>

      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg}`}>

        {icon}

      </div>

    </div>
  );
}

export default function DashboardCards({
  income,
  expense,
  balance,
  savingRate,
}) {
  return (
    <div className="grid lg:grid-cols-2 md:grid-cols-2 gap-6">

      <Card
        title="Total Pendapatan"
        value={`Rp ${income.toLocaleString("id-ID")}`}
        color="text-blue-600"
        iconBg="bg-blue-50"
        icon={<ArrowUpCircle className="text-blue-500" size={28} />}
      />

      <Card
        title="Total Pengeluaran"
        value={`Rp ${expense.toLocaleString("id-ID")}`}
        color="text-red-500"
        iconBg="bg-red-50"
        icon={<ArrowDownCircle className="text-red-400" size={28} />}
      />

      <Card
        title="Cashflow Bersih"
        value={`Rp ${balance.toLocaleString("id-ID")}`}
        color="text-emerald-600"
        iconBg="bg-emerald-50"
        icon={<Wallet className="text-emerald-500" size={28} />}
      />

      <Card
        title="Saving Rate"
        value={`${savingRate}%`}
        color="text-emerald-500"
        iconBg="bg-orange-50"
        icon={<PiggyBank className="text-orange-400" size={28} />}
      />

    </div>
  );
}