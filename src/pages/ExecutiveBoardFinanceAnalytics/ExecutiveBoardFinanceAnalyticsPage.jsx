import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardAppBar from "../../components/dashboard/DashboardAppBar";
import { saveFinanceAnalytics, subscribeToFinanceAnalytics, subscribeToFinanceWorkbooks } from "../../firebase/firestore";
import "./ExecutiveBoardFinanceAnalyticsPage.css";

const parseSheets = (sheets = []) => sheets.map((sheet) => ({
  ...sheet,
  rows: typeof sheet.rowsJson === "string" ? JSON.parse(sheet.rowsJson) : sheet.rows || [],
}));

const getColumnIndex = (headers, name) => headers.findIndex((header) => header.toLowerCase() === name);

const getWorkbookMetrics = (workbook) => {
  let rows = 0;
  let ordered = 0;
  let inStock = 0;
  let notInStock = 0;
  let total = 0;

  parseSheets(workbook.sheets).forEach((sheet) => {
    const quantityIndex = getColumnIndex(sheet.headers, "quantity");
    const priceIndex = getColumnIndex(sheet.headers, "price");
    const totalIndex = getColumnIndex(sheet.headers, "total");
    const orderedIndex = getColumnIndex(sheet.headers, "items ordered or not");
    const stockIndex = getColumnIndex(sheet.headers, "in stock");

    sheet.rows.forEach((row) => {
      if (priceIndex !== -1 && String(row[priceIndex] || "").trim().toLowerCase() === "total") return;
      if (!row.some((cell) => String(cell).trim() !== "")) return;
      rows += 1;
      if (orderedIndex !== -1 && String(row[orderedIndex]).toLowerCase() === "yes") ordered += 1;
      if (stockIndex !== -1) {
        if (String(row[stockIndex]).toLowerCase() === "yes") inStock += 1;
        if (String(row[stockIndex]).toLowerCase() === "no") notInStock += 1;
      }
      const rowTotal = totalIndex !== -1 ? Number(row[totalIndex]) : quantityIndex !== -1 && priceIndex !== -1 ? Number(row[quantityIndex]) * Number(row[priceIndex]) : 0;
      if (Number.isFinite(rowTotal)) total += rowTotal;
    });
  });

  return { rows, ordered, inStock, notInStock, total };
};

export default function ExecutiveBoardFinanceAnalyticsPage() {
  const [workbooks, setWorkbooks] = useState([]);
  const [error, setError] = useState("");
  const [financeValues, setFinanceValues] = useState({ budget: "", prRaisedAmount: "", amountActuallySpent: "", seedMoney: "", balance: "", remarks: "" });
  const [savingValues, setSavingValues] = useState(false);
  const [valuesSaved, setValuesSaved] = useState(false);

  useEffect(() => {
    const unsubscribeWorkbooks = subscribeToFinanceWorkbooks(setWorkbooks, (loadError) => setError(loadError.message || "Unable to load finance analytics."));
    const unsubscribeValues = subscribeToFinanceAnalytics((values) => setFinanceValues((current) => ({ ...current, ...values })), (loadError) => setError(loadError.message || "Unable to load finance values."));
    return () => {
      unsubscribeWorkbooks();
      unsubscribeValues();
    };
  }, []);

  const handleValueChange = (field, value) => {
    setValuesSaved(false);
    setFinanceValues((current) => ({ ...current, [field]: value }));
  };

  const handleSaveValues = async () => {
    setSavingValues(true);
    setError("");
    try {
      await saveFinanceAnalytics(financeValues);
      setValuesSaved(true);
    } catch (saveError) {
      setError(saveError.message || "Unable to save finance values.");
    } finally {
      setSavingValues(false);
    }
  };

  const metrics = useMemo(() => workbooks.reduce((summary, workbook) => {
    const workbookMetrics = getWorkbookMetrics(workbook);
    return {
      workbooks: summary.workbooks + 1,
      rows: summary.rows + workbookMetrics.rows,
      ordered: summary.ordered + workbookMetrics.ordered,
      inStock: summary.inStock + workbookMetrics.inStock,
      notInStock: summary.notInStock + workbookMetrics.notInStock,
      total: summary.total + workbookMetrics.total,
    };
  }, { workbooks: 0, rows: 0, ordered: 0, inStock: 0, notInStock: 0, total: 0 }), [workbooks]);

  return (
    <div className="executive-board-finance-analytics-page">
      <DashboardAppBar />
      <main className="executive-board-finance-analytics-content">
        <section className="executive-board-finance-analytics-hero">
          <Link to="/executive-board/finance" className="executive-board-finance-analytics-back">← FINANCE WORKSPACE</Link>
          <p>EXECUTIVE BOARD WORKSPACE</p>
          <h1>FINANCE ANALYTICS</h1>
          <span>Summary of saved finance workbooks and worksheet activity.</span>
        </section>

        {error && <div className="executive-board-finance-analytics-error" role="alert">{error}</div>}

        <section className="executive-board-finance-analytics-manual" aria-label="Manual finance values">
          <header><div><h2>FINANCE VALUES</h2><p>Enter the current financial figures manually.</p></div><span>{metrics.workbooks} saved workbook{metrics.workbooks === 1 ? "" : "s"}</span></header>
          <div className="executive-board-finance-analytics-fields">
            <label>BUDGET<input type="number" min="0" value={financeValues.budget} onChange={(event) => handleValueChange("budget", event.target.value)} placeholder="Enter budget" /></label>
            <label>PR RAISED AMOUNT<input type="number" min="0" value={financeValues.prRaisedAmount} onChange={(event) => handleValueChange("prRaisedAmount", event.target.value)} placeholder="Enter PR raised amount" /></label>
            <label>AMOUNT ACTUALLY SPENT<input type="number" min="0" value={financeValues.amountActuallySpent} onChange={(event) => handleValueChange("amountActuallySpent", event.target.value)} placeholder="Enter amount spent" /></label>
            <label>SEED MONEY<input type="number" min="0" value={financeValues.seedMoney} onChange={(event) => handleValueChange("seedMoney", event.target.value)} placeholder="Enter seed money" /></label>
            <label>BALANCE<input type="number" value={financeValues.balance} onChange={(event) => handleValueChange("balance", event.target.value)} placeholder="Enter balance" /></label>
            <label>REMARKS<textarea value={financeValues.remarks} onChange={(event) => handleValueChange("remarks", event.target.value)} placeholder="Enter remarks" rows="1" /></label>
          </div>
          <button type="button" className="executive-board-finance-analytics-save" onClick={handleSaveValues} disabled={savingValues}>
            {savingValues ? "SAVING..." : valuesSaved ? "SAVED" : "SAVE FINANCE VALUES"}
          </button>
        </section>

        <section className="executive-board-finance-analytics-list">
          <header><h2>WORKBOOK BREAKDOWN</h2><span>{workbooks.length} saved</span></header>
          {!workbooks.length && <p>No saved workbooks yet.</p>}
          {workbooks.map((workbook) => {
            const workbookMetrics = getWorkbookMetrics(workbook);
            return (
              <article key={workbook.id}>
                <div><strong>{workbook.fileName}</strong><span>{workbook.sheets.length} worksheets</span></div>
                <span>{workbookMetrics.rows} rows</span>
                <span>{workbookMetrics.total.toLocaleString()} total</span>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
