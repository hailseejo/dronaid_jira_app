import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const menuItems = [
    {
      name: "Home",
      path: "/home",
      icon: "⌂",
    },
    {
      name: "Members",
      path: "/members",
      icon: "👥",
    },
    {
      name: "General",
      path: "/general",
      icon: "▣",
    },
    {
      name: "Workspace Dashboard",
      path: "/workspace-dashboard",
      icon: "◈",
    },
    {
      name: "Competitions",
      path: "/competition",
      icon: "🏆",
    },
  ];

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">D</div>

        <div>
          <h2>DRONAID</h2>
          <p>Team Workspace</p>
        </div>
      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">

        <p className="sidebar-title">MAIN MENU</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </NavLink>
        ))}

      </nav>


      {/* Bottom Section */}
      <div className="sidebar-bottom">

        <p className="sidebar-title">WORKSPACE</p>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <span className="sidebar-icon">⚙</span>
          <span>Settings</span>
        </NavLink>

      </div>

    </aside>
  );
}

export default Sidebar;
