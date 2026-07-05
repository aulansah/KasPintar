import { useEffect, useState, useCallback, useMemo } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import WidgetCards from "../components/dashboard/WidgetCards";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import SummaryMonthTable from "../components/summary/SummaryMonthTable";
import SummaryModal from "../components/summary/SummaryModal";
import CicilanTable from "../components/cicilan/CicilanTable";
import LivingCostTable from "../components/living/LivingCostTable";
import FamilyTable from "../components/family/FamilyTable";
import FinanceCharts from "../components/charts/FinanceCharts";

import { useAuth } from "../hooks/useAuth";

import { getMonthlySummary, createSummary, updateSummary, deleteSummary } from "../services/summaryService";
import { getDebtItemsBySummaryIds, createDebtItem, updateDebtItem, deleteDebtItem } from "../services/debtService";
import {
  getLivingCostCategoriesBySummaryIds,
  createLivingCostCategory, updateLivingCostCategory, deleteLivingCostCategory,
  createLivingCostItem, updateLivingCostItem, deleteLivingCostItem,
} from "../services/livingCostService";
import { getFamilyItemsBySummaryIds, upsertFamilyItem } from "../services/familyService";
import { exportToCSV } from "../services/exportService";

import { debtMonthTotal, categoryAmount, totalLivingCost } from "../utils/calculate";

export default function Dashboard() {
  const { user } = useAuth();

  const [summaries, setSummaries] = useState([]);
  const [debtMap, setDebtMap] = useState({});       // { summaryId: debtItem[] }
  const [livingMap, setLivingMap] = useState({});   // { summaryId: category[] }
  const [familyMap, setFamilyMap] = useState({});   // { summaryId: familyItem }

  const [activeTab, setActiveTab] = useState("summary");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load all data ─────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await getMonthlySummary(user.id);
      setSummaries(rows);

      if (rows.length === 0) {
        setDebtMap({});
        setLivingMap({});
        setFamilyMap({});
        return;
      }

      const ids = rows.map((r) => r.id);

      const [debtItems, livingCats, famItems] = await Promise.all([
        getDebtItemsBySummaryIds(ids),
        getLivingCostCategoriesBySummaryIds(ids),
        getFamilyItemsBySummaryIds(ids),
      ]);

      // Build debtMap
      const dm = {};
      ids.forEach((id) => (dm[id] = []));
      debtItems.forEach((item) => {
        if (!dm[item.summary_id]) dm[item.summary_id] = [];
        dm[item.summary_id].push(item);
      });
      setDebtMap(dm);

      // Build livingMap — each category has its items nested
      const lm = {};
      ids.forEach((id) => (lm[id] = []));
      livingCats.forEach((cat) => {
        if (!lm[cat.summary_id]) lm[cat.summary_id] = [];
        lm[cat.summary_id].push(cat);
      });
      setLivingMap(lm);

      // Build familyMap (one record per summary)
      const fm = {};
      famItems.forEach((fi) => {
        fm[fi.summary_id] = fi;
      });
      setFamilyMap(fm);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Derived aggregates for widgets ───────────────────────────────────
  const { sums, negativeMonths, periodLabel } = useMemo(() => {
    let income = 0, expense = 0;
    const neg = [];

    summaries.forEach((s) => {
      const inc = Number(s.income || 0);
      const exp =
        Number(s.cicilan || 0) + Number(s.kontrakan || 0) +
        Number(s.arisan || 0) + Number(s.living_cost || 0) +
        Number(s.keluarga || 0);
      income += inc;
      expense += exp;
      if (inc - exp < 0) neg.push(`${s.bulan} ${s.tahun}`);
    });

    let label = "";
    if (summaries.length > 0) {
      const first = summaries[0];
      const last = summaries[summaries.length - 1];
      label =
        first.id === last.id
          ? `${first.bulan} ${first.tahun}`
          : `${first.bulan} ${first.tahun} – ${last.bulan} ${last.tahun}`;
    }

    return {
      sums: { income, expense, surplus: income - expense },
      negativeMonths: neg,
      periodLabel: label,
    };
  }, [summaries]);

  // ─── Sync helper: recalculate & persist column totals to monthly_summary ──
  async function syncSummaryTotals(summaryId) {
    // Cicilan total
    const cicilanTotal = debtMonthTotal(debtMap[summaryId] ?? []);
    // Living cost total
    const lcCats = livingMap[summaryId] ?? [];
    const lcTotal = totalLivingCost(lcCats);
    // Family total
    const fam = familyMap[summaryId];
    const keluargaTotal =
      Number(fam?.ortu || 0) + Number(fam?.adik || 0) + Number(fam?.tak_terduga || 0);

    await updateSummary(summaryId, {
      cicilan: cicilanTotal,
      living_cost: lcTotal,
      keluarga: keluargaTotal,
    });

    // Refresh summary rows
    const rows = await getMonthlySummary(user.id);
    setSummaries(rows);
  }

  // ─── Summary CRUD ──────────────────────────────────────────────────────
  function handleAddMonth() {
    setEditingRow(null);
    setModalOpen(true);
  }

  function handleEditMonth(row) {
    setEditingRow(row);
    setModalOpen(true);
  }

  async function handleSaveMonth(form) {
    try {
      if (editingRow) {
        await updateSummary(editingRow.id, { bulan: form.bulan, tahun: form.tahun });
      } else {
        await createSummary({ ...form, user_id: user.id, income: 0 });
      }
      setModalOpen(false);
      setEditingRow(null);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function handleDeleteMonth(id) {
    if (!window.confirm("Hapus bulan ini beserta semua data terkait?")) return;
    try {
      await deleteSummary(id);
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  // Inline field save (income, kontrakan, arisan)
  async function handleFieldSave(summaryId, field, value) {
    try {
      await updateSummary(summaryId, { [field]: value });
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, [field]: value } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  // ─── Debt CRUD ─────────────────────────────────────────────────────────
  async function handleAddDebtItem(summaryId, userId) {
    try {
      const newItem = await createDebtItem({
        summary_id: summaryId,
        user_id: userId || user.id,
        name: "Cicilan baru",
        amount: 0,
        note: "",
      });
      setDebtMap((prev) => ({
        ...prev,
        [summaryId]: [...(prev[summaryId] ?? []), newItem],
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdateDebtItem(itemId, summaryId, patch) {
    try {
      await updateDebtItem(itemId, patch);
      setDebtMap((prev) => {
        const items = (prev[summaryId] ?? []).map((i) =>
          i.id === itemId ? { ...i, ...patch } : i
        );
        return { ...prev, [summaryId]: items };
      });
      // Sync total cicilan to monthly_summary
      const updatedItems = (debtMap[summaryId] ?? []).map((i) =>
        i.id === itemId ? { ...i, ...patch } : i
      );
      const cicilanTotal = debtMonthTotal(updatedItems);
      await updateSummary(summaryId, { cicilan: cicilanTotal });
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, cicilan: cicilanTotal } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteDebtItem(itemId, summaryId) {
    try {
      await deleteDebtItem(itemId);
      const remaining = (debtMap[summaryId] ?? []).filter((i) => i.id !== itemId);
      setDebtMap((prev) => ({ ...prev, [summaryId]: remaining }));
      const cicilanTotal = debtMonthTotal(remaining);
      await updateSummary(summaryId, { cicilan: cicilanTotal });
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, cicilan: cicilanTotal } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  // ─── Living Cost CRUD ──────────────────────────────────────────────────
  async function handleAddCategory(summaryId, userId) {
    try {
      const newCat = await createLivingCostCategory({
        summary_id: summaryId,
        user_id: userId || user.id,
        name: "Kategori baru",
        kind: "fixed",
        summary: "",
        description: "",
        sort_order: (livingMap[summaryId] ?? []).length,
      });
      newCat.items = [];
      setLivingMap((prev) => ({
        ...prev,
        [summaryId]: [...(prev[summaryId] ?? []), newCat],
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdateCategory(catId, summaryId, patch) {
    try {
      await updateLivingCostCategory(catId, patch);
      setLivingMap((prev) => {
        const cats = (prev[summaryId] ?? []).map((c) =>
          c.id === catId ? { ...c, ...patch } : c
        );
        return { ...prev, [summaryId]: cats };
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteCategory(catId, summaryId) {
    if (!window.confirm("Hapus kategori beserta semua itemnya?")) return;
    try {
      await deleteLivingCostCategory(catId);
      const remaining = (livingMap[summaryId] ?? []).filter((c) => c.id !== catId);
      setLivingMap((prev) => ({ ...prev, [summaryId]: remaining }));
      const lcTotal = totalLivingCost(remaining);
      await updateSummary(summaryId, { living_cost: lcTotal });
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, living_cost: lcTotal } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddLivingItem(catId, summaryId) {
    try {
      const newItem = await createLivingCostItem({
        category_id: catId,
        name: "Item baru",
        qty: 1,
        trips: 1,
        unit_cost: 0,
        unit: "bulan",
        note: "",
        sort_order: 0,
      });
      setLivingMap((prev) => {
        const cats = (prev[summaryId] ?? []).map((c) => {
          if (c.id !== catId) return c;
          return { ...c, items: [...(c.items ?? []), newItem] };
        });
        return { ...prev, [summaryId]: cats };
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpdateLivingItem(itemId, catId, summaryId, patch) {
    try {
      await updateLivingCostItem(itemId, patch);
      let lcTotal = 0;
      setLivingMap((prev) => {
        const cats = (prev[summaryId] ?? []).map((c) => {
          if (c.id !== catId) return c;
          const items = (c.items ?? []).map((i) =>
            i.id === itemId ? { ...i, ...patch } : i
          );
          return { ...c, items };
        });
        lcTotal = totalLivingCost(cats);
        return { ...prev, [summaryId]: cats };
      });
      await updateSummary(summaryId, { living_cost: lcTotal });
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, living_cost: lcTotal } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteLivingItem(itemId, catId, summaryId) {
    try {
      await deleteLivingCostItem(itemId);
      let lcTotal = 0;
      setLivingMap((prev) => {
        const cats = (prev[summaryId] ?? []).map((c) => {
          if (c.id !== catId) return c;
          const items = (c.items ?? []).filter((i) => i.id !== itemId);
          return { ...c, items };
        });
        lcTotal = totalLivingCost(cats);
        return { ...prev, [summaryId]: cats };
      });
      await updateSummary(summaryId, { living_cost: lcTotal });
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, living_cost: lcTotal } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  // ─── Family CRUD ───────────────────────────────────────────────────────
  async function handleFamilyUpdate(summaryId, userId, patch) {
    try {
      await upsertFamilyItem(summaryId, userId || user.id, patch);
      setFamilyMap((prev) => {
        const existing = prev[summaryId] ?? {};
        const updated = { ...existing, ...patch, summary_id: summaryId };
        return { ...prev, [summaryId]: updated };
      });
      // Sync keluarga total
      const existing = familyMap[summaryId] ?? {};
      const merged = { ...existing, ...patch };
      const keluargaTotal =
        Number(merged.ortu || 0) + Number(merged.adik || 0) + Number(merged.tak_terduga || 0);
      await updateSummary(summaryId, { keluarga: keluargaTotal });
      setSummaries((prev) =>
        prev.map((s) => (s.id === summaryId ? { ...s, keluarga: keluargaTotal } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  // ─── CSV Export ────────────────────────────────────────────────────────
  function handleExport() {
    exportToCSV({ summaries, debtMap, livingMap, familyMap });
  }

  // ─── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="kp-loading">
          <div className="kp-spinner" />
          <span>Memuat data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sums={sums} negativeMonths={negativeMonths} onExport={handleExport}>

      {/* Widget Cards */}
      <WidgetCards sums={sums} negativeMonths={negativeMonths} periodLabel={periodLabel} />

      {/* Tab Bar */}
      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "summary" && (
        <SummaryMonthTable
          data={summaries}
          onAdd={handleAddMonth}
          onEdit={handleEditMonth}
          onDelete={handleDeleteMonth}
          onFieldSave={handleFieldSave}
        />
      )}

      {activeTab === "cicilan" && (
        <CicilanTable
          summaries={summaries}
          debtMap={debtMap}
          onAddItem={handleAddDebtItem}
          onUpdateItem={handleUpdateDebtItem}
          onDeleteItem={handleDeleteDebtItem}
        />
      )}

      {activeTab === "living" && (
        <LivingCostTable
          summaries={summaries}
          livingMap={livingMap}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddItem={handleAddLivingItem}
          onUpdateItem={handleUpdateLivingItem}
          onDeleteItem={handleDeleteLivingItem}
        />
      )}

      {activeTab === "keluarga" && (
        <FamilyTable
          summaries={summaries}
          familyMap={familyMap}
          onUpdate={handleFamilyUpdate}
        />
      )}

      {activeTab === "charts" && (
        <FinanceCharts summaries={summaries} livingMap={livingMap} />
      )}

      {/* Add/Edit Month Modal */}
      <SummaryModal
        open={modalOpen}
        editingData={editingRow}
        onClose={() => { setModalOpen(false); setEditingRow(null); }}
        onSave={handleSaveMonth}
      />

    </DashboardLayout>
  );
}