import { Link } from "react-router-dom";
import "./ExecutiveBoardPage.css";

export default function ExecutiveBoardPage() {
  return (
    <main className="executive-board-page">
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

      <section className="executive-board-panel" aria-labelledby="executive-board-title">
        <div className="executive-board-logo">
          <div className="drone-icon">
            <svg viewBox="0 0 100 40" width="80" height="32" fill="none">
              <path d="M20 20 L80 20 M35 10 L65 30 M35 30 L65 10" stroke="#00f2fe" strokeWidth="2" />
              <circle cx="20" cy="20" r="8" stroke="#00f2fe" strokeWidth="2" />
              <circle cx="80" cy="20" r="8" stroke="#00f2fe" strokeWidth="2" />
              <circle cx="50" cy="20" r="10" fill="#0b091a" stroke="#00f2fe" strokeWidth="2" />
              <path d="M50 15 V25 M45 20 H55" stroke="#ff4b4b" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="executive-board-brand">DR<span>O</span>NAID</div>
        </div>

        <div className="executive-board-heading">
          <p>SECURE ACCESS PORTAL</p>
          <h1 id="executive-board-title">EB PORTAL</h1>
        </div>

        <nav className="executive-board-actions" aria-label="Executive board actions">
          <Link to="/login">LOGIN <span aria-hidden="true">→</span></Link>
          <Link to="/signup?role=executive-board">SIGN UP <span aria-hidden="true">→</span></Link>
          <Link to="/login?role=executive-board&redirect=%2Fexecutive-board%2Fmembers">
            SIGN UP MEMBERS <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </section>
    </main>
  );
}