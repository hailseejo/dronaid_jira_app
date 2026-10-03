import { useState } from "react";
import dronaidLogo from "../../assets/dronaid-logo.jpeg";
import { IconUser, IconChevronDown } from "../common/icons";
import "./AppBar.css";

export default function AppBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="app-bar">
      <div className="app-bar-brand">
        <img src={dronaidLogo} alt="DRONAID" className="app-bar-logo" />
      </div>

      <button
        className="app-bar-profile"
        type="button"
        onClick={() => setIsProfileOpen((open) => !open)}
        aria-expanded={isProfileOpen}
      >
        <div className="app-bar-avatar">
          <IconUser />
        </div>
        <span className="app-bar-chevron">
          <IconChevronDown />
        </span>
      </button>
      {isProfileOpen && (
        <div className="profile-menu">
          <strong>Team member</strong>
          <span>member@dronaid.io</span>
          <button type="button" onClick={() => setIsProfileOpen(false)}>Close menu</button>
        </div>
      )}
    </header>
  );
}
