import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import { auth } from "../../firebase/auth";

import LoginInput from "./LoginInput";
import ForgotPassword from "./ForgotPassword";

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const initialFormData = {
  username: "",
  password: "",
};

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  const [remember, setRemember] = useState(false);

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.username.trim()) {
      nextErrors.username = "Email is required";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Remember me:
      // checked   → keep user signed in
      // unchecked → session only
      await setPersistence(
        auth,
        remember
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      // REAL FIREBASE LOGIN
      await signInWithEmailAndPassword(
        auth,
        formData.username.trim(),
        formData.password
      );

      // Firebase successfully authenticated the user
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      switch (err.code) {
        case "auth/invalid-credential":
          setServerError("Invalid email or password.");
          break;

        case "auth/user-not-found":
          setServerError("No account found with this email.");
          break;

        case "auth/wrong-password":
          setServerError("Incorrect password.");
          break;

        case "auth/invalid-email":
          setServerError("Please enter a valid email address.");
          break;

        case "auth/too-many-requests":
          setServerError(
            "Too many login attempts. Please try again later."
          );
          break;

        default:
          setServerError(
            "Unable to sign in. Please try again."
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        className="login-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {serverError && (
          <div className="alert alert-danger">
            {serverError}
          </div>
        )}

        <LoginInput
          icon={<UserIcon />}
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your email"
          error={errors.username}
        />

        <LoginInput
          icon={<LockIcon />}
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
        />

        <div className="login-row">
          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) =>
                setRemember(e.target.checked)
              }
            />

            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="login-forgot"
            onClick={() => setIsForgotOpen(true)}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="login-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}

          <ArrowRightIcon />
        </button>
      </form>

      <ForgotPassword
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </>
  );
}

export default LoginForm;