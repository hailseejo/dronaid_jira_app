import "./PageHeader.css";

const TABS = ["General", "Competition", "Team"];

export default function PageHeader({ activeTab, onTabChange }) {
  return (
    <nav className="dashboard-tabs" aria-label="Dashboard sections">
      {TABS.map((tab) => (
        <button key={tab} type="button" className={`dashboard-tab ${activeTab === tab ? "active" : ""}`} onClick={() => onTabChange(tab)}>
          {tab}
        </button>
      ))}
    </nav>
  );
}
