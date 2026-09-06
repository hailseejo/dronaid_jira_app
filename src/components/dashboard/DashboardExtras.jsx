import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Megaphone, Plus, Trash2 } from "lucide-react";

const startingAnnouncements = [
  { id: "a1", title: "Design review is scheduled for Friday", time: "2h ago" },
];

function monthDays(cursor) {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const lead = start.getDay();
  const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - lead + 1;
    return day > 0 && day <= total ? day : null;
  });
}

export default function DashboardExtras() {
  const [cursor, setCursor] = useState(new Date(2025, 5, 1));
  const [selected, setSelected] = useState(4);
  const [events, setEvents] = useState({ 4: "Design review", 12: "Sensor calibration", 18: "Team sync" });
  const [announcements, setAnnouncements] = useState(startingAnnouncements);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [newEvent, setNewEvent] = useState("");
  const days = useMemo(() => monthDays(cursor), [cursor]);
  const label = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const addAnnouncement = (event) => {
    event.preventDefault();
    if (!newAnnouncement.trim()) return;
    setAnnouncements((items) => [{ id: crypto.randomUUID(), title: newAnnouncement.trim(), time: "Just now" }, ...items]);
    setNewAnnouncement("");
  };

  const addEvent = (event) => {
    event.preventDefault();
    if (!newEvent.trim()) return;
    setEvents((items) => ({ ...items, [selected]: newEvent.trim() }));
    setNewEvent("");
  };

  const deleteEvent = (day) => {
    setEvents((items) => {
      const next = { ...items };
      delete next[day];
      return next;
    });
  };

  return <section className="workspace-grid" id="announcements">
    <section className="workspace-card calendar-workspace">
      <header><h2><CalendarDays /> Calendar</h2><div><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft /></button><strong>{label}</strong><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight /></button></div></header>
      <div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-cells">{days.map((day, index) => <button key={index} className={`calendar-cell ${day === selected ? "selected" : ""}`} disabled={!day} onClick={() => setSelected(day)}>{day && <><b>{day}</b>{events[day] && <small>{events[day]}</small>}</>}</button>)}</div>
      <form className="calendar-add" onSubmit={addEvent}><span>Selected: {selected} {label}</span><input value={newEvent} onChange={(event) => setNewEvent(event.target.value)} placeholder="Add calendar task" aria-label="New calendar task" /><button type="submit">Add</button>{events[selected] && <button type="button" className="calendar-delete" onClick={() => deleteEvent(selected)} aria-label={`Delete event on ${selected} ${label}`} title="Delete selected event"><Trash2 /></button>}</form>
    </section>
    <section className="workspace-card announcement-workspace">
      <header><h2><Megaphone /> Announcements</h2><span>{announcements.length} update{announcements.length === 1 ? "" : "s"}</span></header>
      <form className="announcement-add" onSubmit={addAnnouncement}><input value={newAnnouncement} onChange={(event) => setNewAnnouncement(event.target.value)} placeholder="Write an announcement" aria-label="New announcement" /><button type="submit" aria-label="Add announcement"><Plus /></button></form>
      <div className="workspace-announcement-list">{announcements.map((item) => <article key={item.id}><i /><div><strong>{item.title}</strong><small>{item.time}</small></div><button onClick={() => setAnnouncements((items) => items.filter((announcement) => announcement.id !== item.id))} aria-label={`Delete ${item.title}`}><Trash2 /></button></article>)}</div>
    </section>
  </section>;
}
