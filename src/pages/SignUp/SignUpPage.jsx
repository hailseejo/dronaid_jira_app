import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import "./SignUpPage.css";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Firebase Detailed Sign Up Error:", err);
      
      // Displays the exact error code from Firebase directly in the alert box
      setError(`[${err.code || "ERROR"}]: ${err.message || "Failed to register"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="bg-grid"></div>
      <div className="glow-left"></div>
      <div className="glow-right"></div>

      <div className="hud-overlay hud-left">
        <div><span className="hud-label">SYS</span> 01</div>
        <div><span className="hud-label">STATUS</span> : REGISTRATION</div>
        <div><span className="hud-label">LINK</span> : SECURE</div>
      </div>

      <div className="hud-overlay hud-right">
        <div><span className="hud-label">MODE</span> : NEW USER</div>
        <div><span className="hud-label">ENCRYPTION</span> : AES-256</div>
      </div>

      <div className="signup-card">
        <div className="back-nav">
          <Link to="/login" className="back-button">
            ← Back to Sign In
          </Link>
        </div>

        <div className="logo-container">
          <div className="drone-icon">
            <svg viewBox="0 0 100 40" width="80" height="32" fill="none">
              <path d="M20 20 L80 20 M35 10 L65 30 M35 30 L65 10" stroke="#00f2fe" strokeWidth="2" />
              <circle cx="20" cy="20" r="8" stroke="#00f2fe" strokeWidth="2" />
              <circle cx="80" cy="20" r="8" stroke="#00f2fe" strokeWidth="2" />
              <circle cx="50" cy="20" r="10" fill="#0b091a" stroke="#00f2fe" strokeWidth="2" />
              <path d="M50 15 V25 M45 20 H55" stroke="#ff4b4b" strokeWidth="2.5" />
            </svg>
          </div>
          <h1 className="logo-text">DR<span className="highlight-o">O</span>NAID</h1>
        </div>

        <div className="signup-header">
          <h2>Create Account</h2>
          <p>Register new operator profile</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSignUp} className="signup-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "CREATING ACCOUNT..." : "REGISTER ACCOUNT"}
            {!loading && <span className="btn-arrow">→</span>}
          </button>
        </form>

        <div className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}