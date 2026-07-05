import Header from "../components/Header";

export default function DashboardLayout({ children, sums, negativeMonths, onExport }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header sums={sums} negativeMonths={negativeMonths} onExport={onExport} />
      <div className="kp-main" style={{ flex: 1 }}>
        {children}
      </div>
      <footer className="kp-footer">
        © {new Date().getFullYear()} KAS PINTAR — Personal Finance Manager. Data disimpan aman di Supabase.
      </footer>
    </div>
  );
}