import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="bg-grid"></div>

      {/* Top HUD Bar */}
      <header className="dash-header">
        <div className="brand">
          <h1>DR<span className="highlight-o">O</span>NAID</h1>
          <span className="badge-online">SYSTEM ONLINE</span>
        </div>

        <div className="user-profile">
          <span className="operator-id">OPERATOR: {currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            DISCONNECT
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="dash-content">
        <div className="dash-card">
          <h3>FLIGHT TELEMETRY</h3>
          <div className="stat-row"><span>ALTITUDE:</span> <b>120 M</b></div>
          <div className="stat-row"><span>SPEED:</span> <b>18.4 M/S</b></div>
          <div className="stat-row"><span>BATTERY:</span> <b style={{ color: "#10b981" }}>76%</b></div>
        </div>

        <div className="dash-card">
          <h3>NAVIGATION STATUS</h3>
          <div className="stat-row"><span>GPS LINK:</span> <b>LOCKED (12 SAT)</b></div>
          <div className="stat-row"><span>SIGNAL:</span> <b>STABLE (-42 dBm)</b></div>
          <div className="stat-row"><span>MODE:</span> <b>AUTONOMOUS ASSIST</b></div>
        </div>
      </main>
    </div>
  );
}