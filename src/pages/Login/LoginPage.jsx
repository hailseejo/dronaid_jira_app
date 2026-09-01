import { useState } from "react";
import logo from "../../assets/dronaid-logo.jpeg";
import { loginUser } from "../../firebase/auth";
import "./LoginPage.css";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  try {
    await loginUser(email, password);

    console.log("Login successful!");

    window.location.href = "/";
  } catch (error) {
    console.error("Login failed:", error);

    if (error.code === "auth/invalid-credential") {
      alert("Invalid email or password.");
    } else if (error.code === "auth/invalid-email") {
      alert("Please enter a valid email.");
    } else if (error.code === "auth/too-many-requests") {
      alert("Too many login attempts. Try again later.");
    } else {
      alert(error.message);
    }
  }
};

  return (
    <div className="login-page">

      {/* ================= BACKGROUND HUD ================= */}

      <div className="hud-grid"></div>

      <div className="hud-corner hud-corner-tl"></div>
      <div className="hud-corner hud-corner-tr"></div>
      <div className="hud-corner hud-corner-bl"></div>
      <div className="hud-corner hud-corner-br"></div>

      {/* Decorative crosses */}
      <div className="hud-cross cross-1">+</div>
      <div className="hud-cross cross-2">+</div>
      <div className="hud-cross cross-3">+</div>
      <div className="hud-cross cross-4">+</div>

      {/* ================= LEFT HUD ================= */}

      <div className="login-hud login-hud-left">
        <p>SYS 01</p>
        <p>STATUS : <span>OK</span></p>
        <p>CONNECTION : STABLE</p>
        <p>LINK : SECURE</p>
      </div>

      <div className="login-hud login-hud-bottom-left">
        <p>GPS : <span>LOCKED</span></p>
        <p>SAT : 12</p>
        <p>MODE : STANDBY</p>
      </div>

      {/* ================= RIGHT HUD ================= */}

      <div className="login-hud login-hud-right">
        <p>ALT : 120M</p>
        <p>SPD : 18.4 M/S</p>
        <p>BAT : <span>76%</span></p>
      </div>

      {/* ================= DECORATIVE DRONE ================= */}

      <div className="drone-decoration">
        <div className="drone-body"></div>

        <div className="drone-arm drone-arm-left"></div>
        <div className="drone-arm drone-arm-right"></div>

        <div className="drone-motor motor-1"></div>
        <div className="drone-motor motor-2"></div>
        <div className="drone-motor motor-3"></div>
        <div className="drone-motor motor-4"></div>

        <div className="drone-prop prop-1"></div>
        <div className="drone-prop prop-2"></div>
        <div className="drone-prop prop-3"></div>
        <div className="drone-prop prop-4"></div>
      </div>

      {/* ================= LOGIN CARD ================= */}

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo-container">
          <img
            src={logo}
            alt="Dronaid"
            className="login-logo"
          />
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome</h1>
          <p>Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Username */}
          <div className="form-group">
           <label htmlFor="username">
  Email
</label>

            <div className="input-wrapper">
              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>
              </span>

              <input
  id="username"
  type="email"
  placeholder="Enter your email"
  autoComplete="username"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <input
  id="password"
  type={showPassword ? "text" : "password"}
  placeholder="Enter your password"
  autoComplete="current-password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "◉" : "◌"}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="login-options">

            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />

              <span className="custom-checkbox"></span>

              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot password?
            </button>

          </div>

          {/* Sign in */}
          <button
            type="submit"
            className="sign-in-button"
          >
            <span>SIGN IN</span>

            <span className="arrow">
              →
            </span>
          </button>

        </form>

      </div>

    </div>
  );
}

export default LoginPage;