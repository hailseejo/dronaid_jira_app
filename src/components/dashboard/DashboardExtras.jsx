import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Megaphone, Plus, Trash2 } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { useCalendarTasks, createCalendarTask, deleteCalendarTask } from "../../hooks/useCalendarTasks";
import { useAnnouncements, createAnnouncement, deleteAnnouncement } from "../../hooks/useAnnouncements";

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthDays(cursor) {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const lead = start.getDay();
  const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - lead + 1;
    return day > 0 && day <= total ? day : null;
  });
}

function timeAgo(createdAt) {
  const then = createdAt?.toDate ? createdAt.toDate() : null;
  if (!then) return "Just now";
  const seconds = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardExtras() {
  const { currentUser, userProfile } = useAuthContext();
  const canManageAnnouncements = userProfile?.role === "EB";
  const isAdmin = canManageAnnouncements;
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [newEvent, setNewEvent] = useState("");
  const [announcementNotice, setAnnouncementNotice] = useState("");
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  const { tasks: calendarTasks, loading: calendarLoading } = useCalendarTasks();
  const { announcements, loading: announcementsLoading } = useAnnouncements();

  const days = useMemo(() => monthDays(cursor), [cursor]);
  const label = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selectedKey = toDateKey(selected);
  const selectedLabel = selected.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  // Group Firestore calendar tasks by their full date key ("YYYY-MM-DD") so
  // the same day-of-month in different months/years is never confused, and
  // more than one task can exist on the same date.
  const tasksByDate = useMemo(() => {
    const map = {};
    calendarTasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [calendarTasks]);

  const selectedDayTasks = tasksByDate[selectedKey] || [];

  const addAnnouncement = async (event) => {
    if (!canManageAnnouncements) return;
    event.preventDefault();
    const title = newAnnouncement.trim();
    if (!title || announcementSaving) return;
    setAnnouncementSaving(true);
    setAnnouncementNotice("");
    try {
      await createAnnouncement({ title, createdBy: currentUser?.uid, createdByName: userProfile?.name });
      setNewAnnouncement("");
      setAnnouncementNotice("Announcement posted.");
    } catch (err) {
      console.error("Error creating announcement:", err);
      setAnnouncementNotice(err.message || "Could not post announcement.");
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const addEvent = (event) => {
    event.preventDefault();
    if (!newEvent.trim()) return;
    createCalendarTask({ title: newEvent.trim(), date: selectedKey, createdBy: currentUser?.uid }).catch((err) =>
      console.error("Error creating calendar task:", err)
    );
    setNewEvent("");
  };

  return <section className="workspace-grid" id="announcements">
    <section className="workspace-card calendar-workspace">
      <header><h2><CalendarDays /> Calendar</h2><div><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft /></button><strong>{label}</strong><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight /></button></div></header>
      <div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-cells">
        {calendarLoading && <p className="empty-widget">Loading calendar...</p>}
        {!calendarLoading && days.map((day, index) => {
          if (!day) return <button key={index} className="calendar-cell" disabled />;
          const dateKey = toDateKey(new Date(cursor.getFullYear(), cursor.getMonth(), day));
          const dayTasks = tasksByDate[dateKey] || [];
          const summary = dayTasks.length
            ? dayTasks.length > 1
              ? `${dayTasks[0].title} +${dayTasks.length - 1}`
              : dayTasks[0].title
            : null;
          return (
            <button
              key={index}
              className={`calendar-cell ${dateKey === selectedKey ? "selected" : ""}`}
              onClick={() => setSelected(new Date(cursor.getFullYear(), cursor.getMonth(), day))}
            >
              <b>{day}</b>{summary && <small>{summary}</small>}
            </button>
          );
        })}
      </div>
      <form className="calendar-add" onSubmit={addEvent}>
        <span>Selected: {selectedLabel}</span>
        <input value={newEvent} onChange={(event) => setNewEvent(event.target.value)} placeholder="Add calendar task" aria-label="New calendar task" />
        <button type="submit">Add</button>
      </form>
      {selectedDayTasks.length > 0 && (
        <ul className="calendar-selected-tasks">
          {selectedDayTasks.map((task) => (
            <li key={task.id}>
              <span>{task.title}</span>
              <button
                type="button"
                className="calendar-delete"
                onClick={() => deleteCalendarTask(task.id).catch((err) => console.error("Error deleting calendar task:", err))}
                aria-label={`Delete ${task.title} on ${selectedLabel}`}
                title="Delete this task"
              >
                <Trash2 />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
    <section className="workspace-card announcement-workspace">
      <header><h2><Megaphone /> Announcements</h2><span>{announcements.length} update{announcements.length === 1 ? "" : "s"}</span></header>
      {isAdmin && <form className="announcement-add" onSubmit={addAnnouncement}><input value={newAnnouncement} onChange={(event) => setNewAnnouncement(event.target.value)} placeholder="Write an announcement" aria-label="New announcement" /><button type="submit" aria-label="Add announcement" disabled={announcementSaving}>{announcementSaving ? "..." : <Plus />}</button></form>}
      {announcementNotice && <button type="button" className="announcement-widget-notice" onClick={() => setAnnouncementNotice("")}>{announcementNotice}</button>}
      <div className="workspace-announcement-list">
        {announcementsLoading && <p className="empty-widget">Loading announcements...</p>}
        {!announcementsLoading && announcements.length === 0 && <p className="empty-widget">No announcements yet.</p>}
        {announcements.map((item) => (
          <article key={item.id}>
            <i />
            <div><strong>{item.title}</strong><small>{timeAgo(item.createdAt)}</small></div>
            {isAdmin && <button
              onClick={() => deleteAnnouncement(item.id).catch((err) => console.error("Error deleting announcement:", err))}
              aria-label={`Delete ${item.title}`}
            >
              <Trash2 />
            </button>}
          </article>
        ))}
      </div>
    </section>
  </section>;
}