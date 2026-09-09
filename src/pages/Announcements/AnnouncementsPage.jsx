import { useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import DashboardAppBar from "../../components/dashboard/DashboardAppBar";
import { useAuthContext } from "../../context/AuthContext";
import { useAnnouncements, createAnnouncement, deleteAnnouncement } from "../../hooks/useAnnouncements";
import "./AnnouncementsPage.css";

function formatDate(value) {
  if (!value?.toDate) return "Just now";
  return value.toDate().toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AnnouncementsPage() {
  const { currentUser, userProfile } = useAuthContext();
  const canManageAnnouncements = userProfile?.role === "EB";
  const isAdmin = canManageAnnouncements;
  const { announcements, loading } = useAnnouncements();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [notice, setNotice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const submitAnnouncement = async (event) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) return;
    try {
      await createAnnouncement({ title: title.trim(), message: message.trim(), priority, category: category.trim(), createdBy: currentUser.uid, createdByName: userProfile?.name });
      setTitle(""); setMessage(""); setPriority(""); setCategory(""); setFormOpen(false); setNotice("Announcement posted.");
    } catch (announcementError) { setNotice(announcementError.message || "Could not post announcement."); }
  };

  const removeAnnouncement = async (announcement) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try { await deleteAnnouncement(announcement.id); setNotice("Announcement deleted."); }
    catch (announcementError) { setNotice(announcementError.message || "Could not delete announcement."); }
  };

  return <div className="reference-dashboard announcements-shell">
    <Sidebar />
    <DashboardAppBar profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
    <main className="announcements-content">
      <header className="announcements-heading"><div><p className="announcements-eyebrow">DRONAID // COMMS</p><h1><Megaphone /> Announcements</h1><p>Updates from the Executive Board for every subsystem.</p></div>{isAdmin && <button type="button" className="announcements-create" onClick={() => setFormOpen((open) => !open)}><Plus /> {formOpen ? "CLOSE" : "CREATE ANNOUNCEMENT"}</button>}</header>
      {isAdmin && formOpen && <form className="announcement-form" onSubmit={submitAnnouncement}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" aria-label="Announcement title" required /><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Announcement" aria-label="Announcement message" rows="5" required /><div className="announcement-form-row"><select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority"><option value="">Priority (optional)</option><option>High</option><option>Medium</option><option>Low</option></select><input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category (optional)" aria-label="Category" /><button type="submit">POST ANNOUNCEMENT</button></div></form>}
      {notice && <button type="button" className="announcement-notice" onClick={() => setNotice("")}>{notice}</button>}
      {loading && <p className="announcement-state">Loading announcements...</p>}{!loading && announcements.filter((announcement) => !announcement.subsystem).length === 0 && <p className="announcement-state">No announcements yet.</p>}
      <div className="announcements-list">{announcements.filter((announcement) => !announcement.subsystem).map((announcement) => <article className="announcement-full-card" key={announcement.id}><div className="announcement-card-top"><div><p className="announcement-card-meta">{announcement.category || "DRONAID UPDATE"}{announcement.priority && ` // ${announcement.priority.toUpperCase()}`}</p><h2>{announcement.title}</h2></div>{isAdmin && <button type="button" className="announcement-delete" onClick={() => removeAnnouncement(announcement)} aria-label={`Delete ${announcement.title}`} title="Delete announcement"><Trash2 /></button>}</div><p className="announcement-card-message">{announcement.message || "No message provided."}</p><footer>Posted by: {announcement.createdByName || "Executive Board"}<span>{formatDate(announcement.createdAt)}</span></footer></article>)}</div>
    </main>
  </div>;
}