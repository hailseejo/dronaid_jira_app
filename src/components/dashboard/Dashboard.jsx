import { useState } from "react";
import "./Dashboard.css";
import DashboardAppBar from "./DashboardAppBar";

const events = [];

function readStoredList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function Arrow() { return <span className="general-arrow" aria-hidden="true">›</span>; }

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function Calendar() {
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(new Date(2026, 8, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 4));
  const [customEvents, setCustomEvents] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem("dronaid-calendar-events")) ?? []).map((event, index) => ({
        ...event,
        id: event.id ?? `saved-${index}`,
      }));
    } catch {
      return [];
    }
  });
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTone, setTaskTone] = useState("purple");

  const changePeriod = (direction) => {
    const next = new Date(cursor);
    if (view === "month") next.setMonth(next.getMonth() + direction);
    if (view === "week") next.setDate(next.getDate() + (direction * 7));
    if (view === "day") next.setDate(next.getDate() + direction);
    setCursor(next);
  };

  const goToToday = () => {
    const today = new Date();
    setCursor(today);
    setSelectedDate(today);
  };

  const getEvents = (date) => [...events, ...customEvents].filter((event) => event.date === dateKey(date));
  const weekStart = new Date(cursor);
  weekStart.setDate(cursor.getDate() - cursor.getDay());
  const removeTask = (taskId) => {
    const updatedEvents = customEvents.filter((event) => event.id !== taskId);
    setCustomEvents(updatedEvents);
    localStorage.setItem("dronaid-calendar-events", JSON.stringify(updatedEvents));
  };

  const renderEvent = (event) => <span className={`calendar-event ${event.tone}`} key={event.id ?? event.title}><i />{event.title}{event.id && <button type="button" className="delete-calendar-event" aria-label={`Delete ${event.title}`} onClick={(clickEvent) => { clickEvent.stopPropagation(); removeTask(event.id); }}>×</button>}</span>;
  const renderDay = (date, outsideMonth = false) => {
    const isSelected = dateKey(date) === dateKey(selectedDate);
    const isToday = dateKey(date) === dateKey(new Date());
    const openTaskForm = () => { setSelectedDate(new Date(date)); setTaskTitle(""); setIsTaskFormOpen(true); };
    return <div role="button" tabIndex={0} className={`calendar-day ${outsideMonth ? "outside" : ""} ${isSelected ? "selected-day" : ""} ${isToday ? "today-date" : ""}`} key={dateKey(date)} onClick={openTaskForm} onKeyDown={(keyEvent) => { if (keyEvent.key === "Enter" || keyEvent.key === " ") openTaskForm(); }}><span>{date.getDate()}</span>{getEvents(date).map(renderEvent)}</div>;
  };

  const addTask = (event) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    const updatedEvents = [...customEvents, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, date: dateKey(selectedDate), title, tone: taskTone }];
    setCustomEvents(updatedEvents);
    localStorage.setItem("dronaid-calendar-events", JSON.stringify(updatedEvents));
    setTaskTitle("");
    setIsTaskFormOpen(false);
  };

  const monthName = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - firstDay.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return renderDay(date, date.getMonth() !== cursor.getMonth());
  });
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return <div className="week-day" key={dateKey(date)}><button type="button" onClick={() => setSelectedDate(date)} className={dateKey(date) === dateKey(selectedDate) ? "week-date selected-day" : "week-date"}><small>{date.toLocaleDateString("en-US", { weekday: "short" })}</small><strong>{date.getDate()}</strong></button><div className="week-events">{getEvents(date).map(renderEvent)}</div></div>;
  });
  const dayEvents = getEvents(selectedDate);

  return <section className="calendar-panel panel"><h2 className="section-title">CALENDAR</h2><div className="calendar-controls"><div className="calendar-left-controls"><button type="button" className="control-button" onClick={goToToday}>Today</button><div className="pager"><button type="button" aria-label="Previous period" onClick={() => changePeriod(-1)}>‹</button><button type="button" aria-label="Next period" onClick={() => changePeriod(1)}>›</button></div><strong>{view === "day" ? selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : monthName}</strong></div><div className="view-switcher" aria-label="Calendar view">{["month", "week", "day"].map((item) => <button type="button" key={item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div></div>{view === "month" && <div className="calendar-grid">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <div className="weekday" key={day}>{day}</div>)}{days}</div>}{view === "week" && <div className="calendar-week">{weekDays}</div>}{view === "day" && <div className="calendar-day-view"><div><small>{selectedDate.toLocaleDateString("en-US", { weekday: "long" })}</small><strong>{selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</strong></div><div className="day-event-list">{dayEvents.length ? dayEvents.map(renderEvent) : <p>No events scheduled for this day.</p>}</div></div>}{isTaskFormOpen && <div className="task-modal-backdrop" onMouseDown={() => setIsTaskFormOpen(false)}><form className="task-modal" onSubmit={addTask} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="close-task-modal" onClick={() => setIsTaskFormOpen(false)} aria-label="Close">×</button><p>ADD CALENDAR TASK</p><h3>{selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3><label>Task name<input autoFocus value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="e.g. Flight controller review" /></label><label>Label color<select value={taskTone} onChange={(event) => setTaskTone(event.target.value)}><option value="purple">Purple</option><option value="yellow">Yellow</option></select></label><button type="submit" className="save-task-button">Add task</button></form></div>}</section>;
}

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState(() => readStoredList("dronaid-announcements"));
  const [deadlines, setDeadlines] = useState(() => readStoredList("dronaid-deadlines"));
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [deadlineForm, setDeadlineForm] = useState({ title: "", detail: "", date: "", remaining: "" });
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);
  const [isDeadlineFormOpen, setIsDeadlineFormOpen] = useState(false);

  const addAnnouncement = (event) => {
    event.preventDefault();
    const title = announcementTitle.trim();
    if (!title) return;
    const now = new Date();
    const updated = [{ id: crypto.randomUUID(), title, date: now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) }, ...announcements];
    setAnnouncements(updated);
    saveList("dronaid-announcements", updated);
    setAnnouncementTitle("");
    setIsAnnouncementFormOpen(false);
  };

  const addDeadline = (event) => {
    event.preventDefault();
    if (!deadlineForm.title.trim() || !deadlineForm.date) return;
    const deadlineDate = new Date(`${deadlineForm.date}T00:00:00`);
    const updated = [{ id: crypto.randomUUID(), title: deadlineForm.title.trim(), detail: deadlineForm.detail.trim(), month: deadlineDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), day: deadlineDate.getDate(), remaining: deadlineForm.remaining.trim() || "Upcoming" }, ...deadlines];
    setDeadlines(updated);
    saveList("dronaid-deadlines", updated);
    setDeadlineForm({ title: "", detail: "", date: "", remaining: "" });
    setIsDeadlineFormOpen(false);
  };

  const deleteAnnouncement = (id) => {
    const updated = announcements.filter((announcement) => announcement.id !== id);
    setAnnouncements(updated);
    saveList("dronaid-announcements", updated);
  };

  const deleteDeadline = (id) => {
    const updated = deadlines.filter((deadline) => deadline.id !== id);
    setDeadlines(updated);
    saveList("dronaid-deadlines", updated);
  };

  return <div className="general-page"><DashboardAppBar /><main className="general-content"><div className="general-main-column"><section className="project-banner panel"><p className="eyebrow">SUBSYSTEM</p><div className="banner-copy"><h1>PROJECT DRONAID</h1><p>DESIGN <b>|</b> BUILD <b>|</b> COMPETE <b>|</b> INNOVATE</p></div><p className="banner-tagline">AUTONOMY<br />FOR A<br />BETTER TOMORROW</p></section><Calendar /></div><aside className="general-sidebar"><section className="panel sidebar-panel"><div className="sidebar-heading"><h2 className="section-title">ANNOUNCEMENTS</h2><button type="button" onClick={() => setIsAnnouncementFormOpen((open) => !open)}>+ Add</button></div>{isAnnouncementFormOpen && <form className="management-form" onSubmit={addAnnouncement}><input aria-label="Announcement title" placeholder="Announcement title" value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} required /><button type="submit">Save</button></form>}<div className="announcement-list">{announcements.length ? announcements.map((announcement) => <div className="announcement" key={announcement.id}><i /><span><strong>{announcement.title}</strong><small>{announcement.date} &nbsp;&nbsp; {announcement.time}</small></span><button type="button" className="item-delete" onClick={() => deleteAnnouncement(announcement.id)} aria-label={`Delete ${announcement.title}`}>×</button></div>) : <p className="empty-list">No announcements yet.</p>}</div></section><section className="panel sidebar-panel deadlines-panel"><div className="sidebar-heading"><h2 className="section-title">UPCOMING DEADLINES</h2><button type="button" onClick={() => setIsDeadlineFormOpen((open) => !open)}>+ Add</button></div>{isDeadlineFormOpen && <form className="management-form" onSubmit={addDeadline}><input aria-label="Deadline title" placeholder="Deadline title" value={deadlineForm.title} onChange={(event) => setDeadlineForm({ ...deadlineForm, title: event.target.value })} required /><input aria-label="Deadline details" placeholder="Details" value={deadlineForm.detail} onChange={(event) => setDeadlineForm({ ...deadlineForm, detail: event.target.value })} /><input aria-label="Deadline date" type="date" value={deadlineForm.date} onChange={(event) => setDeadlineForm({ ...deadlineForm, date: event.target.value })} required /><input aria-label="Time remaining" placeholder="e.g. 8 days" value={deadlineForm.remaining} onChange={(event) => setDeadlineForm({ ...deadlineForm, remaining: event.target.value })} /><button type="submit">Save</button></form>}<div className="deadline-list">{deadlines.length ? deadlines.map((deadline) => <div className="deadline" key={deadline.id}><div className="deadline-date"><small>{deadline.month}</small><strong>{deadline.day}</strong></div><div className="deadline-copy"><strong>{deadline.title}</strong><small>{deadline.detail}</small></div><span className="days-left">{deadline.remaining}</span><button type="button" className="item-delete" onClick={() => deleteDeadline(deadline.id)} aria-label={`Delete ${deadline.title}`}>×</button></div>) : <p className="empty-list">No upcoming deadlines yet.</p>}</div></section></aside></main></div>;
}
