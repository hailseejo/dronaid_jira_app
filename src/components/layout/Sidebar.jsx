import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { SUBSYSTEMS } from "../../constants/subsystems";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/general", label: "General", icon: Home, end: true },
  { to: "/competition", label: "Competition", icon: LayoutGrid },
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
];

export default function Sidebar() {
  const { logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.replace("/");
    }
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Application navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} title={label}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <div className="sidebar-subsystems" aria-label="Subsystems">
            <span className="sidebar-subsystems-label">SUBSYSTEMS</span>
            {SUBSYSTEMS.map((subsystem) => (
              <NavLink
                key={subsystem}
                to={`/subsystem/${encodeURIComponent(subsystem)}`}
                className={({ isActive }) => `sidebar-subsystem-link ${isActive ? "active" : ""}`}
                title={subsystem}
              >
                {subsystem}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
      <button className="sidebar-link sidebar-logout" type="button" onClick={handleLogout} title="Log out"><LogOut /></button>
    </aside>
  );
}
