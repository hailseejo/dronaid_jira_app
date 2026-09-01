import { useState } from "react";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.5 6.7C4 8.3 2 12 2 12s4 7 11 7c1.9 0 3.6-.5 5-1.2M9.9 5.2A10.6 10.6 0 0 1 12 5c7 0 11 7 11 7-.5.9-1.4 2.1-2.7 3.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoginInput({
  icon,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="login-field">
      <label className="login-field-label" htmlFor={name}>
        {label}
      </label>

      <div className={`login-input-wrap${error ? " has-error" : ""}`}>
        <span className="login-input-icon">{icon}</span>

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="login-input"
          autoComplete={isPassword ? "current-password" : "username"}
        />

        {isPassword && (
          <button
            type="button"
            className="login-input-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default LoginInput;