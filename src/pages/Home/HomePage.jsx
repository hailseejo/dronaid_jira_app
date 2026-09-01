import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">

      {/* Futuristic background elements */}
      <div className="login-grid"></div>
      <div className="glow glow-left"></div>
      <div className="glow glow-right"></div>

      {/* Technical information */}
      <div className="system-info system-left">
        <p>SYS 01</p>
        <p>STATUS : OK</p>
        <p>CONNECTION : STABLE</p>
        <p>LINK : SECURE</p>
      </div>

      <div className="system-info system-right">
        <p>ALT : 120M</p>
        <p>SPD : 18.4 M/S</p>
        <p>BAT : 76%</p>
      </div>

      <div className="system-info gps-info">
        <p>GPS : LOCKED</p>
        <p>SAT : 12</p>
        <p>MODE : STANDBY</p>
      </div>

      {/* Login card */}
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <img
            src="/src/assets/dronaid-logo.png"
            alt="DronaID"
          />
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome</h1>
          <p>Sign in to continue</p>
        </div>

        {/* Form */}
        <form className="login-form">

          {/* Username */}
          <div className="login-field">
            <label htmlFor="username">
              Username
            </label>

            <div className="input-wrapper">
              <span className="input-icon">♙</span>

              <input
                id="username"
                type="text"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon">♧</span>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
              />

              <button
                type="button"
                className="password-toggle"
              >
                ◉
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="forgot-row">
            <button
              type="button"
              className="forgot-password"
            >
              Forgot password?
            </button>
          </div>

          {/* Remember me */}
          <div className="remember-row">
            <label className="remember-label">
              <input type="checkbox" />
              <span className="custom-checkbox"></span>
              <span>Remember me</span>
            </label>
          </div>

          {/* Sign in */}
          <button
            type="submit"
            className="login-button"
          >
            <span>SIGN IN</span>
            <span className="arrow">→</span>
          </button>

        </form>
      </div>

    </div>
  );
}

export default LoginPage;