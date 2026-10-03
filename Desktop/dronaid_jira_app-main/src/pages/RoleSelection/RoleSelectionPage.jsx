import { Link } from "react-router-dom";
import "./RoleSelectionPage.css";

function DronaidLogo() {
  return (
    <div className="role-logo-container">
      <div className="drone-icon">
        <svg viewBox="0 0 100 40" width="80" height="32" fill="none">
          <path d="M20 20 L80 20 M35 10 L65 30 M35 30 L65 10" stroke="#00f2fe" strokeWidth="2" />
          <circle cx="20" cy="20" r="8" stroke="#00f2fe" strokeWidth="2" />
          <circle cx="80" cy="20" r="8" stroke="#00f2fe" strokeWidth="2" />
          <circle cx="50" cy="20" r="10" fill="#0b091a" stroke="#00f2fe" strokeWidth="2" />
          <path d="M50 15 V25 M45 20 H55" stroke="#ff4b4b" strokeWidth="2.5" />
        </svg>
      </div>

      <h1 className="role-logo-text">
        DR<span className="highlight-o">O</span>NAID
      </h1>
    </div>
  );
}

export default function RoleSelectionPage() {
  return (
    <main className="role-selection-container">
      <div className="bg-grid" />
      <div className="glow-left" />
      <div className="glow-right" />

      <div className="hud-overlay hud-left">
        <div><span className="hud-label">SYS</span> 01</div>
        <div><span className="hud-label">STATUS</span> : OK</div>
        <div><span className="hud-label">CONNECTION</span> : STABLE</div>
        <div><span className="hud-label">LINK</span> : SECURE</div>
        <br />
        <div><span className="hud-label">GPS</span> : LOCKED</div>
        <div><span className="hud-label">SAT</span> : 12</div>
        <div><span className="hud-label">MODE</span> : STANDBY</div>
      </div>

      <div className="hud-overlay hud-right">
        <div><span className="hud-label">ALT</span> : 120M</div>
        <div><span className="hud-label">SPD</span> : 18.4 M/S</div>
        <div><span className="hud-label">BAT</span> : 76%</div>
      </div>

      <section className="role-selection-card" aria-labelledby="role-selection-title">
        <DronaidLogo />

        <div className="role-selection-header">
          <p className="role-eyebrow">SECURE ACCESS PORTAL</p>
          <h2 id="role-selection-title">Choose your access</h2>
          <p>Select the workspace you want to enter.</p>
        </div>

        <div className="role-options">
          <Link className="role-option role-option-primary" to="/executive-board">
            <span>
              <strong>Executive board</strong>
              <small>Leadership workspace</small>
            </span>
            <span className="role-arrow" aria-hidden="true">→</span>
          </Link>

          <Link className="role-option" to="/login?role=member">
            <span>
              <strong>Member</strong>
              <small>Team member workspace</small>
            </span>
            <span className="role-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}