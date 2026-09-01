import React from "react";
import "./AppBar.css";

function AppBar() {
  return (
    <header className="app-bar">

      {/* Left side - Logo / App Name */}
      <div className="app-bar-left">
        <div className="app-logo">
          D
        </div>

        <div className="app-name">
          DRONAID
        </div>
      </div>

      {/* Right side */}
      <div className="app-bar-right">

        {/* Notification */}
        <button className="app-bar-button" title="Notifications">
          🔔
        </button>

        {/* Theme Button */}
        <button className="app-bar-button" title="Change theme">
          🌙
        </button>

        {/* Profile */}
        <button className="profile-button">
          <div className="profile-avatar">
            U
          </div>

          <div className="profile-info">
            <span className="profile-name">User</span>
            <span className="profile-role">Team Member</span>
          </div>
        </button>

      </div>

    </header>
  );
}

export default AppBar;