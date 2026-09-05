import { NavLink } from "react-router-dom";
import "./DashboardAppBar.css";

export default function DashboardAppBar() {
  return (
    <header className="common-appbar">
      <div className="common-appbar-logo" aria-label="Dronaid">
        <span className="common-logo-drone">✦</span>
        <span>DR<span>O</span>NAID</span>
      </div>

      <nav className="common-appbar-nav" aria-label="Primary navigation">
        <NavLink to="/general" className={({ isActive }) => `common-appbar-link${isActive ? " active" : ""}`}>GENERAL</NavLink>
        <NavLink to="/competition" className={({ isActive }) => `common-appbar-link${isActive ? " active" : ""}`}>COMPETITION</NavLink>
        <NavLink to="/team" className={({ isActive }) => `common-appbar-link${isActive ? " active" : ""}`}>TEAM</NavLink>
      </nav>

      <div className="common-appbar-actions">
        <button type="button" className="common-theme-button" aria-label="Toggle light mode">☼</button>
        <span className="common-appbar-divider" />
        <button type="button" className="common-profile-button" aria-label="Open profile">◯</button>
        <button type="button" className="common-profile-chevron" aria-label="Open profile menu">⌄</button>
      </div>
    </header>
  );
}
