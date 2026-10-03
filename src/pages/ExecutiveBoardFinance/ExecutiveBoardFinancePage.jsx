import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import DashboardAppBar from "../../components/dashboard/DashboardAppBar";
import { useAuthContext } from "../../context/AuthContext";
import { createFinanceWorkbook, deleteFinanceWorkbook, getFinanceAccessMembers, setFinanceAccess, subscribeToFinanceWorkbooks, updateFinanceWorkbookSheets } from "../../firebase/firestore";
import "./ExecutiveBoardFinancePage.css";

const makeUniqueHeaders = (headerRow) => {
  const seenHeaders = new Map();

  return headerRow.map((header, index) => {
    const baseHeader = String(header || `Column ${index + 1}`).trim();
    const count = seenHeaders.get(baseHeader) || 0;
    seenHeaders.set(baseHeader, count + 1);
    return count ? `${baseHeader} (${count + 1})` : baseHeader;
  });
};

const PR_CHECKLIST_FIELDS = [
  { key: "prStatus", label: "STATUS OF PR" },
  { key: "prSent", label: "PR SENT" },
  { key: "prApprovedByFa", label: "PR APPROVED BY FA" },
  { key: "prNumberGenerated", label: "PR NUMBER GENERATED" },
];

const readWorksheet = (worksheet, name) => {
  const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });
  const [headerRow = [], ...dataRows] = sheetRows;
  const sourceHeaders = makeUniqueHeaders(headerRow);
  const headers = [
    ...sourceHeaders,
    "Items Ordered or Not",
    "In Stock",
  ];
  const rows = dataRows
    .map((row) => headers.map((_, index) => row[index] ?? ""))
    .filter((row) => row.some((cell) => String(cell).trim() !== ""));

  return { name, headers, rows };
};

const parseWorkbookSheets = (sheets = []) =>
  sheets.map((sheet) => {
    const headers = Array.isArray(sheet.headers) ? [...sheet.headers] : [];
    if (!headers.includes("Items Ordered or Not")) headers.push("Items Ordered or Not");
    if (!headers.includes("In Stock")) headers.push("In Stock");

    const rows = Array.isArray(sheet.rows)
      ? sheet.rows
      : typeof sheet.rowsJson === "string"
        ? JSON.parse(sheet.rowsJson)
        : [];

    return {
      ...sheet,
      headers,
      rows: rows.map((row) => [...row, ...Array(Math.max(0, headers.length - row.length)).fill("")]),
    };
  });

const recalculateSheetTotals = (sheet, rows) => {
  const quantityIndex = sheet.headers.findIndex((header) => header.toLowerCase() === "quantity");
  const priceIndex = sheet.headers.findIndex((header) => header.toLowerCase() === "price");
  const totalIndex = sheet.headers.findIndex((header) => header.toLowerCase() === "total");

  if (quantityIndex === -1 || priceIndex === -1 || totalIndex === -1) return rows;

  let grandTotal = 0;
  const summaryRowIndex = rows.findIndex((row) => String(row[priceIndex] || "").trim().toLowerCase() === "total");
  const nextRows = rows.map((row, rowIndex) => {
    if (rowIndex === summaryRowIndex) return row;

    const quantity = Number(row[quantityIndex]);
    const price = Number(row[priceIndex]);
    const nextRow = [...row];

    if (Number.isFinite(quantity) && Number.isFinite(price)) {
      const rowTotal = quantity * price;
      nextRow[totalIndex] = rowTotal;
      grandTotal += rowTotal;
    } else {
      nextRow[totalIndex] = "";
    }

    return nextRow;
  });

  if (summaryRowIndex !== -1) {
    nextRows[summaryRowIndex] = [...nextRows[summaryRowIndex]];
    nextRows[summaryRowIndex][totalIndex] = grandTotal;
  }
  return nextRows;
};

const EXPORT_COLUMNS = [
  "Items",
  "Date of Purchase",
  "Date of Delivery",
  "Quantity",
  "Price",
  "Total Price",
  "Amount Sent",
  "PR ID",
];

const findHeaderIndex = (headers, names) => headers.findIndex((header) => names.includes(header.toLowerCase().trim()));

const buildExportSheet = (sheet) => {
  const itemIndex = findHeaderIndex(sheet.headers, ["item name", "item", "website", "product"]);
  const purchaseDateIndex = findHeaderIndex(sheet.headers, ["date of purchase", "purchase date", "order date"]);
  const deliveryDateIndex = findHeaderIndex(sheet.headers, ["date of delivery", "delivery date"]);
  const quantityIndex = findHeaderIndex(sheet.headers, ["quantity", "qty"]);
  const priceIndex = findHeaderIndex(sheet.headers, ["price", "unit price"]);
  const totalIndex = findHeaderIndex(sheet.headers, ["total", "total price"]);
  const amountSentIndex = findHeaderIndex(sheet.headers, ["amount sent", "amount paid", "sent amount"]);

  return sheet.rows
    .filter((row) => priceIndex === -1 || String(row[priceIndex] || "").trim().toLowerCase() !== "total")
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row) => {
      const quantity = quantityIndex === -1 ? "" : row[quantityIndex] ?? "";
      const price = priceIndex === -1 ? "" : row[priceIndex] ?? "";
      const storedTotal = totalIndex === -1 ? "" : row[totalIndex] ?? "";
      const calculatedTotal = Number(quantity) * Number(price);

      return {
        Items: itemIndex === -1 ? "" : row[itemIndex] ?? "",
        "Date of Purchase": purchaseDateIndex === -1 ? "" : row[purchaseDateIndex] ?? "",
        "Date of Delivery": deliveryDateIndex === -1 ? "" : row[deliveryDateIndex] ?? "",
        Quantity: quantity,
        Price: price,
        "Total Price": storedTotal || (Number.isFinite(calculatedTotal) ? calculatedTotal : ""),
        "Amount Sent": amountSentIndex === -1 ? "" : row[amountSentIndex] ?? "",
        "PR ID": sheet.prNumber || "",
      };
    })
    .sort((first, second) => String(first["Date of Purchase"]).localeCompare(String(second["Date of Purchase"])));
};

export default function ExecutiveBoardFinancePage() {
  const { currentUser, userProfile } = useAuthContext();
  const [workbooks, setWorkbooks] = useState([]);
  const [activeSheetNames, setActiveSheetNames] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [savingPrId, setSavingPrId] = useState("");
  const [savedPrId, setSavedPrId] = useState("");
  const [savingPaisId, setSavingPaisId] = useState("");
  const [savedPaisId, setSavedPaisId] = useState("");
  const [dirtyPrIds, setDirtyPrIds] = useState(() => new Set());
  const [dirtyPaisIds, setDirtyPaisIds] = useState(() => new Set());
  const [accessMembers, setAccessMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [accessError, setAccessError] = useState("");
  const [savingAccessId, setSavingAccessId] = useState("");

  useEffect(() => {
    if (userProfile?.role !== "EB") return;
    getFinanceAccessMembers()
      .then(setAccessMembers)
      .catch((loadError) => setAccessError(loadError.message || "Unable to load members."));
  }, [userProfile?.role]);

  const handleFinanceAccessChange = async (member, enabled) => {
    setSavingAccessId(member.id);
    setAccessError("");
    try {
      await setFinanceAccess(member.id, enabled);
      setAccessMembers((current) => current.map((entry) => entry.id === member.id ? { ...entry, financeAccess: enabled } : entry));
    } catch (saveError) {
      setAccessError(saveError.message || "Unable to update finance access.");
    } finally {
      setSavingAccessId("");
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToFinanceWorkbooks(
      (nextWorkbooks) =>
        setWorkbooks(
          nextWorkbooks.map((workbook) => ({
            ...workbook,
            sheets: parseWorkbookSheets(workbook.sheets),
          }))
        ),
      (loadError) => setError(loadError.message || "Unable to load saved finance workbooks.")
    );

    return unsubscribe;
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      if (!workbook.SheetNames.length) throw new Error("This workbook does not contain a worksheet.");

      const nextSheets = workbook.SheetNames.map((name) => readWorksheet(workbook.Sheets[name], name));

      const workbookRef = await createFinanceWorkbook({
        fileName: file.name,
        sheets: nextSheets,
        createdBy: currentUser.uid,
      });
      setActiveSheetNames((current) => ({ ...current, [workbookRef.id]: nextSheets[0].name }));
    } catch (uploadError) {
      setError(uploadError.message || "Unable to read this spreadsheet.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrNumberChange = (workbookId, sheetName, value) => {
    const prId = `${workbookId}-${sheetName}`;
    setDirtyPrIds((current) => new Set(current).add(prId));
    setSavedPrId("");
    setWorkbooks((current) => current.map((workbook) => (
      workbook.id !== workbookId
        ? workbook
        : {
            ...workbook,
            sheets: workbook.sheets.map((sheet) => (
              sheet.name === sheetName ? { ...sheet, prNumber: value } : sheet
            )),
          }
    )));
  };

  const handleItemsOrderedChange = (workbookId, sheetName, rowIndex, value) => {
    setSavedPrId("");
    updateRowCell(workbookId, sheetName, rowIndex, "Items Ordered or Not", value);
  };

  const updateRowCell = (workbookId, sheetName, rowIndex, headerName, value) => {
    setWorkbooks((current) => current.map((workbook) => (
      workbook.id !== workbookId
        ? workbook
        : {
            ...workbook,
            sheets: workbook.sheets.map((sheet) => {
              if (sheet.name !== sheetName) return sheet;
              const cellIndex = sheet.headers.indexOf(headerName);
              return {
                ...sheet,
                rows: sheet.rows.map((row, index) => (
                  index === rowIndex
                    ? row.map((cell, currentIndex) => currentIndex === cellIndex ? value : cell)
                    : row
                )),
              };
            }),
          }
    )));
  };

  const handleInStockChange = (workbookId, sheetName, rowIndex, value) => {
    setSavedPrId("");
    updateRowCell(workbookId, sheetName, rowIndex, "In Stock", value);
  };

  const handleSheetChecklistChange = async (workbookId, sheetName, field, checked) => {
    const workbook = workbooks.find((item) => item.id === workbookId);
    if (!workbook) return;

    const nextSheets = workbook.sheets.map((sheet) => (
      sheet.name === sheetName ? { ...sheet, [field]: checked } : sheet
    ));

    setWorkbooks((current) => current.map((item) => (
      item.id === workbookId ? { ...item, sheets: nextSheets } : item
    )));

    try {
      await updateFinanceWorkbookSheets(workbookId, nextSheets);
    } catch (saveError) {
      setError(saveError.message || "Unable to save the PR checklist.");
    }
  };

  const handlePriceChange = (workbookId, sheetName, rowIndex, value) => {
    setSavedPrId("");
    setWorkbooks((current) => current.map((workbook) => (
      workbook.id !== workbookId
        ? workbook
        : {
            ...workbook,
            sheets: workbook.sheets.map((sheet) => {
              if (sheet.name !== sheetName) return sheet;
              const priceIndex = sheet.headers.findIndex((header) => header.toLowerCase() === "price");
              const updatedRows = sheet.rows.map((row, index) => (
                index === rowIndex
                  ? row.map((cell, currentIndex) => currentIndex === priceIndex ? value : cell)
                  : row
              ));

              return { ...sheet, rows: recalculateSheetTotals(sheet, updatedRows) };
            }),
          }
    )));
  };

  const saveWorkbookChanges = async (workbook) => {
    await updateFinanceWorkbookSheets(workbook.id, workbook.sheets);
  };

  const downloadCompiledWorkbook = (workbook) => {
    const exportWorkbook = XLSX.utils.book_new();

    workbook.sheets.forEach((sheet) => {
      const exportRows = buildExportSheet(sheet);
      const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: EXPORT_COLUMNS });
      XLSX.utils.book_append_sheet(exportWorkbook, worksheet, sheet.name.slice(0, 31) || "Finance");
    });

    XLSX.writeFile(exportWorkbook, `${workbook.fileName.replace(/\.[^/.]+$/, "")}-compiled.xlsx`);
  };

  const handlePaisIdChange = (workbookId, sheetName, value) => {
    const paisId = `${workbookId}-${sheetName}`;
    setDirtyPaisIds((current) => new Set(current).add(paisId));
    setSavedPaisId("");
    setWorkbooks((current) => current.map((workbook) => (
      workbook.id !== workbookId
        ? workbook
        : {
            ...workbook,
            sheets: workbook.sheets.map((sheet) => (
              sheet.name === sheetName ? { ...sheet, paisId: value } : sheet
            )),
          }
    )));
  };

  const handleSavePrNumber = async (workbook) => {
    const sheetName = activeSheetNames[workbook.id] || workbook.sheets[0]?.name;
    const prId = `${workbook.id}-${sheetName}`;
    setSavingPrId(prId);
    setSavedPrId("");
    setError("");

    try {
      await updateFinanceWorkbookSheets(workbook.id, workbook.sheets);
      setSavedPrId(prId);
      setDirtyPrIds((current) => {
        const next = new Set(current);
        next.delete(prId);
        return next;
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to save the PR number.");
    } finally {
      setSavingPrId("");
    }
  };

  const handleSavePaisId = async (workbook) => {
    const sheetName = activeSheetNames[workbook.id] || workbook.sheets[0]?.name;
    const paisId = `${workbook.id}-${sheetName}`;
    setSavingPaisId(paisId);
    setSavedPaisId("");
    setError("");

    try {
      await updateFinanceWorkbookSheets(workbook.id, workbook.sheets);
      setSavedPaisId(paisId);
      setDirtyPaisIds((current) => {
        const next = new Set(current);
        next.delete(paisId);
        return next;
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to save the PAIS ID.");
    } finally {
      setSavingPaisId("");
    }
  };

  const handleDelete = async (workbookId) => {
    setDeletingId(workbookId);
    setError("");

    try {
      await deleteFinanceWorkbook(workbookId);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this workbook.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="executive-board-finance-page">
      <DashboardAppBar />

      <main className="executive-board-finance-content">
        <section className="executive-board-finance-hero" aria-labelledby="finance-title">
          <Link to="/executive-board" className="executive-board-finance-back">← EB PORTAL</Link>

          <header className="executive-board-finance-header">
            <p>EXECUTIVE BOARD WORKSPACE</p>
            <h1 id="finance-title">FINANCE WORKSPACE</h1>
            <span>Upload, inspect, and manage every worksheet from the finance workbook.</span>
            <Link to="/executive-board/finance/analytics" className="executive-board-finance-analytics-link">VIEW FINANCE ANALYTICS →</Link>
          </header>
        </section>

        {userProfile?.role === "EB" && (
          <section className="executive-board-finance-access" aria-labelledby="finance-access-title">
            <div>
              <h2 id="finance-access-title">FINANCE PAGE ACCESS</h2>
              <p>Choose a member to show Finance in their dashboard header and let them use the finance workbooks and analytics.</p>
            </div>
            <div className="executive-board-finance-access-grant">
              <select aria-label="Member to grant finance access" value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)}>
                <option value="">Select a member</option>
                {accessMembers.filter((member) => member.role === "Member").map((member) => (
                  <option key={member.id} value={member.id}>{member.name || member.email || member.id}</option>
                ))}
              </select>
              <button type="button" disabled={!selectedMemberId || accessMembers.find((member) => member.id === selectedMemberId)?.financeAccess} onClick={() => {
                const member = accessMembers.find((entry) => entry.id === selectedMemberId);
                if (member) handleFinanceAccessChange(member, true);
              }}>GRANT ACCESS</button>
            </div>
            {accessError && <p className="executive-board-finance-access-error" role="alert">{accessError}</p>}
            <ul>
              {accessMembers.filter((member) => member.financeAccess === true && member.role === "Member").map((member) => (
                <li key={member.id}><span>{member.name || member.email || member.id}</span><button type="button" disabled={savingAccessId === member.id} onClick={() => handleFinanceAccessChange(member, false)}>{savingAccessId === member.id ? "SAVING..." : "REMOVE ACCESS"}</button></li>
              ))}
            </ul>
          </section>
        )}

        <section className="executive-board-finance-workspace" aria-label="Finance workbook">
          <header className="executive-board-finance-section-header">
            <div>
              <h2>WORKBOOK DATA</h2>
              <p>{workbooks.length ? `${workbooks.length} saved workbook${workbooks.length === 1 ? "" : "s"}` : "Upload your finance workbook to begin"}</p>
            </div>
            <label className="executive-board-finance-upload">
              <span>{loading ? "READING..." : "UPLOAD EXCEL SHEET"}</span>
              <small>.XLSX, .XLS, OR .CSV</small>
              <input type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" onChange={handleFileUpload} disabled={loading} />
            </label>
          </header>

          {error && <div className="executive-board-finance-error" role="alert">{error}</div>}

          {!workbooks.length && <p className="executive-board-finance-empty">No saved workbooks yet. Upload one to create the first finance block.</p>}

          <div className="executive-board-finance-blocks">
            {workbooks.map((workbook) => {
              const activeSheetName = activeSheetNames[workbook.id] || workbook.sheets[0]?.name;
              const activeSheet = workbook.sheets.find((sheet) => sheet.name === activeSheetName);
              const activeSheetId = `${workbook.id}-${activeSheetName}`;
              const prIsSaved = savedPrId === activeSheetId || (!dirtyPrIds.has(activeSheetId) && Boolean(activeSheet?.prNumber));
              const paisIsSaved = savedPaisId === activeSheetId || (!dirtyPaisIds.has(activeSheetId) && Boolean(activeSheet?.paisId));

              return (
                <article className="executive-board-finance-block" key={workbook.id}>
                  <header className="executive-board-finance-file" role="status">
                    <div>
                      <strong>{workbook.fileName}</strong>
                      <span>{workbook.sheets.length} {workbook.sheets.length === 1 ? "worksheet" : "worksheets"}</span>
                    </div>
                    <button type="button" className="executive-board-finance-delete" onClick={() => handleDelete(workbook.id)} disabled={deletingId === workbook.id}>
                      {deletingId === workbook.id ? "DELETING..." : "DELETE"}
                    </button>
                    <button type="button" className="executive-board-finance-download" onClick={() => downloadCompiledWorkbook(workbook)}>
                      DOWNLOAD COMPILED EXCEL
                    </button>
                  </header>

                  <div className="executive-board-finance-sheet-tabs" role="tablist" aria-label={`${workbook.fileName} worksheets`}>
                    {workbook.sheets.map((sheet) => (
                      <button
                        key={sheet.name}
                        type="button"
                        role="tab"
                        aria-selected={sheet.name === activeSheetName}
                        className={sheet.name === activeSheetName ? "active" : ""}
                        onClick={() => setActiveSheetNames((current) => ({ ...current, [workbook.id]: sheet.name }))}
                      >
                        {sheet.name}
                      </button>
                    ))}
                  </div>

                  {activeSheet && (
                    <>
                      <div className="executive-board-finance-sheet-summary">
                        <div>
                          <strong>{activeSheet.name}</strong>
                          <span>{activeSheet.rows.length} {activeSheet.rows.length === 1 ? "record" : "records"}</span>
                        </div>
                        <div className="executive-board-finance-pr-actions">
                          <div className="executive-board-finance-field-row">
                            <label htmlFor={`pr-number-${workbook.id}-${activeSheet.name}`}>PR NUMBER</label>
                            <input
                              id={`pr-number-${workbook.id}-${activeSheet.name}`}
                              value={activeSheet.prNumber || ""}
                              onChange={(event) => handlePrNumberChange(workbook.id, activeSheet.name, event.target.value)}
                              placeholder="e.g. PR-104"
                            />
                            <button
                              type="button"
                              className="executive-board-finance-save-pr"
                              onClick={() => handleSavePrNumber(workbook)}
                              disabled={savingPrId === activeSheetId}
                            >
                              {savingPrId === activeSheetId
                                ? "SAVING..."
                                : prIsSaved
                                  ? "SAVED"
                                  : "SAVE PR"}
                            </button>
                          </div>
                          <div className="executive-board-finance-field-row">
                            <label htmlFor={`pais-id-${workbook.id}-${activeSheet.name}`}>PAIS ID</label>
                            <input
                              id={`pais-id-${workbook.id}-${activeSheet.name}`}
                              value={activeSheet.paisId || ""}
                              onChange={(event) => handlePaisIdChange(workbook.id, activeSheet.name, event.target.value)}
                              placeholder="Enter PAIS ID"
                            />
                            <button
                              type="button"
                              className="executive-board-finance-save-pr"
                              onClick={() => handleSavePaisId(workbook)}
                              disabled={savingPaisId === activeSheetId}
                            >
                              {savingPaisId === activeSheetId
                                ? "SAVING..."
                                : paisIsSaved
                                  ? "SAVED"
                                  : "SAVE PAIS"}
                            </button>
                          </div>
                          <div className="executive-board-finance-sheet-checklist">
                            {PR_CHECKLIST_FIELDS.map(({ key, label }) => (
                              <label key={key}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(activeSheet[key])}
                                  onChange={(event) => handleSheetChecklistChange(workbook.id, activeSheet.name, key, event.target.checked)}
                                />
                                <span>{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      {activeSheet.headers.length > 0 ? (
                        <div className="executive-board-finance-table-wrap">
                          <table className="executive-board-finance-table">
                            <thead><tr>{activeSheet.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                            <tbody>
                              {activeSheet.rows.map((row, rowIndex) => (
                                (() => {
                                  const priceIndex = activeSheet.headers.findIndex((header) => header.toLowerCase() === "price");
                                  const isSummaryRow = priceIndex !== -1 && String(row[priceIndex] || "").trim().toLowerCase() === "total";

                                  return (
                                    <tr key={`${workbook.id}-${rowIndex}`}>
                                      {activeSheet.headers.map((header, cellIndex) => (
                                        <td key={`${rowIndex}-${cellIndex}`}>
                                          {isSummaryRow && ["Items Ordered or Not", "In Stock"].includes(header) ? null
                                            : ["Items Ordered or Not", "In Stock"].includes(header) ? (
                                              <input
                                                type="checkbox"
                                                className="executive-board-finance-status-checkbox"
                                                checked={String(row[cellIndex] || "").toLowerCase() === "yes"}
                                                onChange={(event) => (header === "Items Ordered or Not" ? handleItemsOrderedChange(workbook.id, activeSheet.name, rowIndex, event.target.checked ? "YES" : "NO") : handleInStockChange(workbook.id, activeSheet.name, rowIndex, event.target.checked ? "YES" : "NO"))}
                                                onBlur={() => saveWorkbookChanges(workbook)}
                                                aria-label={`${header} for row ${rowIndex + 1}`}
                                              />
                                            ) : header.toLowerCase() === "price" && String(row[cellIndex] || "").toLowerCase() !== "total" ? (
                                              <input
                                                className="executive-board-finance-price-input"
                                                value={row[cellIndex] || ""}
                                                onChange={(event) => handlePriceChange(workbook.id, activeSheet.name, rowIndex, event.target.value)}
                                                onBlur={() => saveWorkbookChanges(workbook)}
                                                aria-label={`Price change for row ${rowIndex + 1}`}
                                              />
                                            ) : String(row[cellIndex] ?? "")}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })()
                              ))}
                            </tbody>
                          </table>
                          {!activeSheet.rows.length && <p className="executive-board-finance-empty">The worksheet has headers but no records.</p>}
                        </div>
                      ) : <p className="executive-board-finance-empty">This worksheet is empty.</p>}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
