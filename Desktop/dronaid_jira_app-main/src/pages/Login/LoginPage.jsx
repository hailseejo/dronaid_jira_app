import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginUser, resetUserPassword } from "../../firebase/auth";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMemberLogin = searchParams.get("role") === "member";
  const redirectPath = searchParams.get("redirect");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      await loginUser(
        email.trim(),
        password
      );

      navigate(
        redirectPath && redirectPath.startsWith("/") && !redirectPath.startsWith("//")
          ? redirectPath
          : "/dashboard"
      );
    } catch (err) {
      console.error(
        "Firebase Detailed Login Error:",
        err
      );

      setError(
        err.code === "auth/invalid-credential"
          ? "Incorrect email or password. Use the same email and password from EB signup, or reset your password below."
          : `[${err.code || "ERROR"}]: ${err.message || "Failed to sign in"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setError("");
    setResetMessage("");

    if (!email.trim()) {
      setError("Enter your email address first, then select Forgot password.");
      return;
    }

    try {
      await resetUserPassword(email.trim());
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(
        err.code === "auth/user-not-found"
          ? "No Firebase account exists for that email address."
          : err.message || "Unable to send the password reset email."
      );
    }
  };

  return (
    <div className="login-container">

      <div className="bg-grid"></div>
      <div className="glow-left"></div>
      <div className="glow-right"></div>

      <div className="hud-overlay hud-left">
        <div>
          <span className="hud-label">SYS</span> 01
        </div>

        <div>
          <span className="hud-label">STATUS</span> : OK
        </div>

        <div>
          <span className="hud-label">
            CONNECTION
          </span>{" "}
          : STABLE
        </div>

        <div>
          <span className="hud-label">LINK</span> : SECURE
        </div>

        <br />

        <div>
          <span className="hud-label">GPS</span> : LOCKED
        </div>

        <div>
          <span className="hud-label">SAT</span> : 12
        </div>

        <div>
          <span className="hud-label">MODE</span> : STANDBY
        </div>
      </div>

      <div className="hud-overlay hud-right">
        <div>
          <span className="hud-label">ALT</span> : 120M
        </div>

        <div>
          <span className="hud-label">SPD</span> : 18.4 M/S
        </div>

        <div>
          <span className="hud-label">BAT</span> : 76%
        </div>
      </div>

      <div className="login-card">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <span aria-hidden="true">←</span> GO BACK
        </button>

        <div className="logo-container">

          <div className="drone-icon">
            <svg
              viewBox="0 0 100 40"
              width="80"
              height="32"
              fill="none"
            >
              <path
                d="M20 20 L80 20 M35 10 L65 30 M35 30 L65 10"
                stroke="#00f2fe"
                strokeWidth="2"
              />

              <circle
                cx="20"
                cy="20"
                r="8"
                stroke="#00f2fe"
                strokeWidth="2"
              />

              <circle
                cx="80"
                cy="20"
                r="8"
                stroke="#00f2fe"
                strokeWidth="2"
              />

              <circle
                cx="50"
                cy="20"
                r="10"
                fill="#0b091a"
                stroke="#00f2fe"
                strokeWidth="2"
              />

              <path
                d="M50 15 V25 M45 20 H55"
                stroke="#ff4b4b"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <h1 className="logo-text">
            DR
            <span className="highlight-o">O</span>
            NAID
          </h1>

        </div>

        <div className="login-header">
          <h2>Welcome</h2>
          <p>Sign in to continue</p>
        </div>

        {error && (
          <div className="error-badge">
            {error}
          </div>
        )}

        {resetMessage && (
          <div className="reset-message" role="status">
            {resetMessage}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="login-form"
        >

          <div className="form-group">

            <label>
              Username or Email
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

          </div>


          <div className="form-group">

            <label>Password</label>

            <div className="input-wrapper">

              <span className="input-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  />

                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>
              </button>

            </div>

          </div>


          <div className="forgot-link-container">
            <button
              type="button"
              className="forgot-link"
              onClick={handlePasswordReset}
            >
              Forgot password?
            </button>
          </div>


          <div className="remember-container">

            <label className="checkbox-label">

              <input
                type="checkbox"
                checked={remember}
                onChange={(e) =>
                  setRemember(
                    e.target.checked
                  )
                }
              />

              <span className="custom-checkbox"></span>

              Remember me

            </label>

          </div>


          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading
              ? "AUTHENTICATING..."
              : "SIGN IN"}

            {!loading && (
              <span className="btn-arrow">
                →
              </span>
            )}
          </button>

        </form>


        {!isMemberLogin && (
          <div className="signup-footer">
            Don't have an account?{" "}
            <Link to="/signup">
              Sign up
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}