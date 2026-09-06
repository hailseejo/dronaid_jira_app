import { NavLink } from "react-router-dom";
import { IconGrid, IconHome, IconLogout, IconUser } from "../common/icons";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/general", label: "General", icon: IconHome, end: true },
  { to: "/competition", label: "Competition", icon: IconGrid },
  { to: "/team", label: "Team", icon: IconUser },
  { to: "/dashboard", label: "Dashboard", icon: IconGrid },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Application navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} title={label}>
            <Icon />
          </NavLink>
        ))}
      </nav>
      <button className="sidebar-link sidebar-logout" type="button" onClick={logout} title="Log out"><IconLogout /></button>
    </aside>
  );
}
