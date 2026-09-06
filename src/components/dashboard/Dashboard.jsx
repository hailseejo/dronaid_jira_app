import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Trash2, Trophy, UserRound } from "lucide-react";
import DashboardAppBar from "./DashboardAppBar";
import "./Dashboard.css";
import DashboardExtras from "./DashboardExtras";

const initialPeople = ["Member 1", "Member 2", "Member 3", "Member 4", "Member 5"];
const seed = [
  { task: "Design Review", member: "Member 1", priority: "High", status: "In Progress", due: "01 Jun 2025" },
  { task: "Sensor Integration", member: "Member 2", priority: "Medium", status: "In Progress", due: "05 Jun 2025" },
  { task: "Flight Controller Test", member: "Member 3", priority: "Low", status: "To Do", due: "10 Jun 2025" },
];

function formatDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not set";
}

function Telemetry({ side }) {
  const values = side === "left" ? ["ALT : 120M", "SPD : 18.4 M/S", "BAT : 76%"] : ["GPS : LOCKED", "SAT : 12", "MODE : STANDBY"];
  return <aside className={`telemetry telemetry-${side}`}>{values.map((value) => <span key={value}>{value}</span>)}</aside>;
}

function Drone({ className }) {
  return <svg className={`hud-drone ${className}`} viewBox="0 0 360 300"><g fill="none" stroke="currentColor" strokeWidth="1.15"><path d="M91 112 41 69m57 41L39 127m219-15 52-43m-46 60 58 5M104 114l55 28 78-4 30-24-37-13-73 12-53-18Z"/><path d="m156 142-3 89 51 26 15-71-23-45m-39 90-36-11-5-66m140-43 17 84 42 15 11-56-34-44"/><path d="m159 140 37-6 35 17-11 35-40 7-24-22Z"/><ellipse cx="40" cy="69" rx="38" ry="6"/><ellipse cx="38" cy="127" rx="38" ry="6"/><ellipse cx="310" cy="69" rx="38" ry="6"/><ellipse cx="322" cy="134" rx="38" ry="6"/></g></svg>;
}

function CompetitionCard({ competitions, onAdd, onDelete, onOpen, formOpen, setFormOpen, title, setTitle, date, setDate }) {
  return <section className="mini-card competition-card">
    <header>
      <div className="competition-card-title"><Trophy /><h2>Competitions</h2></div>
      <button type="button" className="widget-add" onClick={() => setFormOpen(!formOpen)} aria-label="Add competition" title="Add competition"><Plus /></button>
    </header>
    {formOpen && <form className="competition-add" onSubmit={onAdd}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Competition name" aria-label="Competition name" required /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Competition date" required /><button type="submit">Add</button></form>}
    <div className="competition-list-wrap">
      {competitions.length === 0 && <p className="empty-widget">No competitions yet.</p>}
      {competitions.map((competition) => <article className="competition-item" key={competition.id}>
        <div className="competition-item-header">
          <span className="competition-badge"><i className="label-dot" /> Current</span>
          <button type="button" className="widget-delete" onClick={() => onDelete(competition.id)} aria-label={`Delete ${competition.title}`} title="Delete competition"><Trash2 /></button>
        </div>
        <h3 className="competition-title">{competition.title}</h3>
        <div className="competition-date-wrap">
          <span className="label event-label">Event Date</span>
          <span className="competition-date-val">{competition.date}</span>
        </div>
      </article>)}
    </div>
    <button type="button" className="competition-footer-link" onClick={onOpen}>View Details <b>-&gt;</b></button>
  </section>;
}

export default function Dashboard() {
  const people = initialPeople;
  const [tasks, setTasks] = useState(seed);
  const [competitions, setCompetitions] = useState([{ id: "c1", title: "DroneTech 2025", date: "15 - 18 Aug 2025" }]);
  const [newTask, setNewTask] = useState("");
  const [newMember, setNewMember] = useState("All Members");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newCompetition, setNewCompetition] = useState("");
  const [competitionDate, setCompetitionDate] = useState("");
  const [competitionFormOpen, setCompetitionFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const cycle = (index) => setTasks((rows) => rows.map((row, rowIndex) => rowIndex !== index ? row : { ...row, status: row.status === "To Do" ? "In Progress" : row.status === "In Progress" ? "Done" : "To Do" }));
  const addTask = (event) => {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTasks((rows) => [...rows, { task: newTask.trim(), member: newMember, priority: newPriority, status: "To Do", due: formatDate(newDueDate), id: crypto.randomUUID() }]);
    setNewTask("");
    setNewDueDate("");
  };
  const addCompetition = (event) => {
    event.preventDefault();
    if (!newCompetition.trim() || !competitionDate) return;
    setCompetitions((items) => [...items, { id: crypto.randomUUID(), title: newCompetition.trim(), date: formatDate(competitionDate) }]);
    setNewCompetition("");
    setCompetitionDate("");
    setCompetitionFormOpen(false);
  };

  return <div className="reference-dashboard">
    <DashboardAppBar profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
    <Telemetry side="left" /><Telemetry side="right" /><Drone className="drone-left" /><Drone className="drone-right" />
    <div className="circuit circuit-left" /><div className="circuit circuit-right" />
    <main className="reference-content">
      <section className="top-grid">
        <section className="subsystem-card"><h1>Sub system Name</h1><div className="member-grid">{people.map((person) => <button type="button" className="member-card" key={person} onClick={() => navigate("/team")}><UserRound /><span>{person}</span></button>)}</div></section>
        <CompetitionCard competitions={competitions} onAdd={addCompetition} onDelete={(id) => setCompetitions((items) => items.filter((item) => item.id !== id))} onOpen={() => navigate("/competition")} formOpen={competitionFormOpen} setFormOpen={setCompetitionFormOpen} title={newCompetition} setTitle={setNewCompetition} date={competitionDate} setDate={setCompetitionDate} />
      </section>
      <section className="tasks-card"><header className="tasks-heading"><h2><Bell /> Ongoing Tasks Overview</h2><form className="task-add" onSubmit={addTask}><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a task" aria-label="New task" required /><input className="task-member-input" value={newMember === "All Members" ? "" : newMember} onChange={(event) => setNewMember(event.target.value || "All Members")} placeholder="Member name" aria-label="Member name" /><select value={newPriority} onChange={(event) => setNewPriority(event.target.value)} aria-label="Task priority"><option>High</option><option>Medium</option><option>Low</option></select><input className="task-due-input" type="date" value={newDueDate} onChange={(event) => setNewDueDate(event.target.value)} aria-label="Task due date" /><button type="submit" aria-label="Add task" title="Add task"><Plus /></button></form></header><div className="task-table"><div className="task-row task-head"><span>Task</span><span>Assigned To</span><span>Priority</span><span>Status</span><span>Due Date</span><span className="task-action-head" /></div>{tasks.map((task, index) => <div className="task-row" key={task.id || `${task.task}-${index}`}><span className="task-name">{task.task}</span><span>{task.member}</span><span className="priority"><i /> {task.priority}</span><button type="button" className={`status status-${task.status.toLowerCase().replace(" ", "-")}`} onClick={() => cycle(index)}>{task.status}</button><span>{task.due}</span><button type="button" className="widget-delete" onClick={() => setTasks((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} aria-label={`Delete ${task.task}`} title="Delete task"><Trash2 /></button></div>)}</div></section>
      <DashboardExtras />
    </main>
    {notice && <button className="dashboard-toast" onClick={() => setNotice("")}>{notice}<span>x</span></button>}
  </div>;
}
