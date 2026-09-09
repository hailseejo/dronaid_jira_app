import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getMemberRoster } from "../../firebase/memberManagement";
import "./ExecutiveBoardMembersPage.css";

export default function ExecutiveBoardMembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  const loadMembers = async () => {
    setLoading(true);
    setError("");

    try {
      setMembers(await getMemberRoster());
    } catch (loadError) {
      console.error("Unable to load EB member roster:", loadError);
      setError(loadError.message || "Unable to load the member roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(loadMembers, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;

    return members.filter((member) =>
      [member.fullName, member.email, member.roleAndSubsystem, member.hierarchyTier, member.memberId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [members, search]);

  const handleMemberClick = (member) => {
    if (member.registered) {
      setNotice(`${member.fullName} is already registered.`);
      return;
    }

    navigate(`/executive-board/members/create?email=${encodeURIComponent(member.email)}`);
  };

  return (
    <main className="eb-members-page">
      <div className="bg-grid" />
      <div className="glow-left" />
      <div className="glow-right" />

      <section className="eb-members-card" aria-labelledby="eb-members-title">
        <div className="eb-members-topbar">
          <Link to="/executive-board" className="eb-members-back">← EB PORTAL</Link>
          <span className="eb-members-status">ADMIN ACCESS</span>
        </div>

        <header className="eb-members-header">
          <p className="eb-members-eyebrow">OFFICIAL ROSTER / FIREBASE STATUS</p>
          <h1 id="eb-members-title">SIGN UP MEMBERS</h1>
          <p>Select an unregistered member to create their account.</p>
        </header>

        <label className="eb-members-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search members..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {notice && (
          <div className="eb-members-notice" role="status">
            {notice}
            <button type="button" onClick={() => setNotice("")}>Dismiss</button>
          </div>
        )}

        {loading && <div className="eb-members-state">LOADING MEMBER ROSTER...</div>}
        {error && (
          <div className="eb-members-error" role="alert">
            {error}
            <button type="button" onClick={loadMembers}>TRY AGAIN</button>
          </div>
        )}
        {!loading && !error && filteredMembers.length === 0 && (
          <div className="eb-members-state">NO MEMBERS MATCH YOUR SEARCH.</div>
        )}

        {!loading && !error && filteredMembers.length > 0 && (
          <div className="eb-members-table-wrap">
            <table className="eb-members-table">
              <thead>
                <tr>
                  <th>STATUS</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  {members.some((member) => member.memberId) && <th>MEMBER ID</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.email}
                    className={member.registered ? "is-registered" : "is-unregistered"}
                    onClick={() => handleMemberClick(member)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") handleMemberClick(member);
                    }}
                    tabIndex={0}
                  >
                    <td>
                      <span className={`member-status ${member.registered ? "registered" : "unregistered"}`}>
                        {member.registered ? "✓" : "✗"}
                      </span>
                    </td>
                    <td>
                      <strong>{member.fullName}</strong>
                      <small>{member.hierarchyTier}</small>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.roleAndSubsystem}</td>
                    {members.some((item) => item.memberId) && <td>{member.memberId || "-"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
