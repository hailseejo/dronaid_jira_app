import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { createMemberAccount, getMemberRoster } from "../../firebase/memberManagement";
import "./ExecutiveBoardMemberSignupPage.css";

const generateTemporaryPassword = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const values = new Uint32Array(12);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
};

export default function ExecutiveBoardMemberSignupPage() {
  const [searchParams] = useSearchParams();
  const [member, setMember] = useState(null);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadMember = async () => {
      try {
        const email = searchParams.get("email")?.toLowerCase();
        const roster = await getMemberRoster();
        const selectedMember = roster.find((item) => item.email === email);

        if (!selectedMember) {
          setError("Member not found in the official roster.");
        } else if (selectedMember.registered) {
          setError("This member already has an account.");
        } else {
          setMember(selectedMember);
          setPassword(generateTemporaryPassword());
        }
      } catch (loadError) {
        console.error("Unable to load selected member:", loadError);
        setError(loadError.message || "Unable to load the selected member.");
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [searchParams]);

  const copyPassword = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await createMemberAccount(member.email, password);
      setSuccess(`Account created for ${member.fullName}. Give the temporary password to the member securely.`);
    } catch (saveError) {
      console.error("Unable to create member account:", saveError);
      setError(saveError.message || "Unable to create the member account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="member-signup-page">
      <div className="bg-grid" />
      <div className="glow-left" />
      <div className="glow-right" />

      <section className="member-signup-card" aria-labelledby="member-signup-title">
        <Link to="/executive-board/members" className="member-signup-back">← MEMBER ROSTER</Link>

        <div className="member-signup-brand">DR<span>O</span>NAID</div>
        <header className="member-signup-header">
          <p>EB MEMBER REGISTRATION</p>
          <h1 id="member-signup-title">CREATE MEMBER ACCOUNT</h1>
        </header>

        {loading && <div className="member-signup-state">LOADING MEMBER DETAILS...</div>}
        {error && <div className="member-signup-error" role="alert">{error}</div>}
        {success && (
          <div className="member-signup-success" role="status">
            <strong>{success}</strong>
            <span>Temporary password: {password}</span>
            <button type="button" onClick={copyPassword}>{copied ? "COPIED" : "COPY PASSWORD"}</button>
            <button type="button" onClick={() => navigate("/executive-board/members")}>RETURN TO MEMBER LIST</button>
          </div>
        )}

        {!loading && member && !success && (
          <form className="member-signup-form" onSubmit={handleSubmit}>
            <div className="member-signup-grid">
              <label>Name<input value={member.fullName} readOnly /></label>
              <label>Email<input value={member.email} readOnly /></label>
              <label>Role<input value={member.roleAndSubsystem} readOnly /></label>
              {member.memberId && <label>Member ID<input value={member.memberId} readOnly /></label>}
            </div>

            <label>Password
              <input type="text" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
            </label>

            <div className="member-signup-actions">
              <button type="button" className="secondary-action" onClick={() => setPassword(generateTemporaryPassword())}>GENERATE PASSWORD</button>
              <button type="button" className="secondary-action" onClick={copyPassword}>COPY PASSWORD</button>
            </div>

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              {!saving && <span>→</span>}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
