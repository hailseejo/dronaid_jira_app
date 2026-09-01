import { useState } from "react";

function ForgotPassword({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail("");
    setStatus("idle");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setStatus("sending");

    try {
      // TODO: replace with a real request, e.g.
      // await authService.requestPasswordReset(email);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Reset password</h3>
          <button
            className="close-button"
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {status === "sent" ? (
            <div className="alert alert-success">
              Check your inbox — we sent a reset link to {email}.
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="form-error">{error}</p>}
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            {status === "sent" ? "Close" : "Cancel"}
          </button>

          {status !== "sent" && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Send reset link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;