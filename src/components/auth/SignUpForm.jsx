import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginInput from "./LoginInput";

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 6.5 12 13l8.5-6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function SignUpForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreed) {
      nextErrors.agreed = "You must accept the terms to continue";
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
      // TODO: replace with your real Firebase sign-up call, e.g.
      // const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // await updateProfile(cred.user, { displayName: formData.name });
      await new Promise((resolve) => setTimeout(resolve, 600));

      navigate("/login");
    } catch (err) {
      setServerError(err?.message || "Could not create your account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert alert-danger">{serverError}</div>}

      <LoginInput
        icon={<UserIcon />}
        label="Full name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your name"
        error={errors.name}
      />

      <LoginInput
        icon={<MailIcon />}
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        error={errors.email}
      />

      <LoginInput
        icon={<LockIcon />}
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Create a password"
        error={errors.password}
      />

      <LoginInput
        icon={<LockIcon />}
        label="Confirm password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
      />

      <label className="signup-terms">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>
          I agree to the <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>
        </span>
      </label>
      {errors.agreed && <p className="form-error">{errors.agreed}</p>}

      <button type="submit" className="login-submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Sign Up"}
        <ArrowRightIcon />
      </button>
    </form>
  );
}

export default SignUpForm;