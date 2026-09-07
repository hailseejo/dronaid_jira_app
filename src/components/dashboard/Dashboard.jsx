import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Trash2, Trophy, UserRound } from "lucide-react";
import DashboardAppBar from "./DashboardAppBar";
import "./Dashboard.css";
import DashboardExtras from "./DashboardExtras";
import { useAuthContext } from "../../context/AuthContext";
import { useMembers } from "../../hooks/useMembers";
import { useSubsystemTasks, useCreateTask, updateTaskStatus, deleteTask } from "../../hooks/useTasks";
import { useCompetitions, createCompetition, deleteCompetition } from "../../hooks/useCompetitions";

function formatDate(value) {
  if (!value) return "Not set";
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate);
  if (!endDate) return start;
  return `${start} – ${formatDate(endDate)}`;
}

function Telemetry({ side }) {
  const values = side === "left" ? ["ALT : 120M", "SPD : 18.4 M/S", "BAT : 76%"] : ["GPS : LOCKED", "SAT : 12", "MODE : STANDBY"];
  return <aside className={`telemetry telemetry-${side}`}>{values.map((value) => <span key={value}>{value}</span>)}</aside>;
}

function Drone({ className }) {
  return <svg className={`hud-drone ${className}`} viewBox="0 0 360 300"><g fill="none" stroke="currentColor" strokeWidth="1.15"><path d="M91 112 41 69m57 41L39 127m219-15 52-43m-46 60 58 5M104 114l55 28 78-4 30-24-37-13-73 12-53-18Z"/><path d="m156 142-3 89 51 26 15-71-23-45m-39 90-36-11-5-66m140-43 17 84 42 15 11-56-34-44"/><path d="m159 140 37-6 35 17-11 35-40 7-24-22Z"/><ellipse cx="40" cy="69" rx="38" ry="6"/><ellipse cx="38" cy="127" rx="38" ry="6"/><ellipse cx="310" cy="69" rx="38" ry="6"/><ellipse cx="322" cy="134" rx="38" ry="6"/></g></svg>;
}

function CompetitionCard({ competitions, onAdd, onDelete, onOpen, formOpen, setFormOpen, name, setName, startDate, setStartDate }) {
  return <section className="mini-card competition-card">
    <header>
      <div className="competition-card-title"><Trophy /><h2>Competitions</h2></div>
      <button type="button" className="widget-add" onClick={() => setFormOpen(!formOpen)} aria-label="Add competition" title="Add competition"><Plus /></button>
    </header>
    {formOpen && <form className="competition-add" onSubmit={onAdd}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Competition name" aria-label="Competition name" required /><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} aria-label="Competition start date" required /><button type="submit">Add</button></form>}
    <div className="competition-list-wrap">
      {competitions.length === 0 && <p className="empty-widget">No competitions yet.</p>}
      {competitions.map((competition) => <article className="competition-item" key={competition.id}>
        <div className="competition-item-header">
          <span className="competition-badge"><i className="label-dot" /> Current</span>
          <button type="button" className="widget-delete" onClick={() => onDelete(competition.id)} aria-label={`Delete ${competition.name}`} title="Delete competition"><Trash2 /></button>
        </div>
        <h3 className="competition-title">{competition.name}</h3>
        <div className="competition-date-wrap">
          <span className="label event-label">Event Date</span>
          <span className="competition-date-val">{formatDateRange(competition.startDate, competition.endDate)}</span>
        </div>
      </article>)}
    </div>
    <button type="button" className="competition-footer-link" onClick={onOpen}>View Details <b>-&gt;</b></button>
  </section>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuthContext();

  const scope = isAdmin ? "all" : "subsystem";
  const { members: people, loading: membersLoading } = useMembers(userProfile?.subsystem, { scope });
  const { tasks, loading: tasksLoading } = useSubsystemTasks(userProfile?.subsystem, { scope });
  const createTask = useCreateTask({ userProfile, currentUser });

  const { competitions } = useCompetitions();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newCompetitionName, setNewCompetitionName] = useState("");
  const [newCompetitionStart, setNewCompetitionStart] = useState("");
  const [competitionFormOpen, setCompetitionFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const memberNameById = useMemo(() => {
    const map = new Map();
    people.forEach((person) => map.set(person.id, person.name));
    return map;
  }, [people]);

  const canManageTask = (task) =>
    isAdmin || task.createdBy === currentUser?.uid || task.assignedTo === currentUser?.uid;

  const cycleStatus = (task) => {
    if (!canManageTask(task)) return;
    const next = task.status === "To Do" ? "In Progress" : task.status === "In Progress" ? "Done" : task.status === "Done" ? "Ongoing" : "In Progress";
    updateTaskStatus(task.id, next).catch((err) => setNotice(err.message || "Could not update task."));
  };

  const removeTask = (task) => {
    if (!canManageTask(task)) return;
    deleteTask(task.id).catch((err) => setNotice(err.message || "Could not delete task."));
  };

  const addTask = (event) => {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({
      title: newTaskTitle.trim(),
      assignedTo: newAssignee || null,
      priority: newPriority,
      dueDate: newDueDate || null,
    }).catch((err) => setNotice(err.message || "Could not create task."));
    setNewTaskTitle("");
    setNewAssignee("");
    setNewDueDate("");
  };

  const addCompetition = (event) => {
    event.preventDefault();
    if (!newCompetitionName.trim() || !newCompetitionStart) return;
    createCompetition({
      name: newCompetitionName.trim(),
      startDate: newCompetitionStart,
      createdBy: currentUser?.uid,
    }).catch((err) => setNotice(err.message || "Could not create competition."));
    setNewCompetitionName("");
    setNewCompetitionStart("");
    setCompetitionFormOpen(false);
  };

  const removeCompetition = (id) => {
    deleteCompetition(id).catch((err) => setNotice(err.message || "Could not delete competition."));
  };

  const subsystemLabel = isAdmin ? "All Subsystems" : userProfile?.subsystem || "";

  return <div className="reference-dashboard">
    <DashboardAppBar profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
    <Telemetry side="left" /><Telemetry side="right" /><Drone className="drone-left" /><Drone className="drone-right" />
    <div className="circuit circuit-left" /><div className="circuit circuit-right" />
    <main className="reference-content">
      <section className="top-grid">
        <section className="subsystem-card">
          <h1>{subsystemLabel}</h1>
          {membersLoading && <p className="empty-widget">Loading members...</p>}
          {!membersLoading && people.length === 0 && <p className="empty-widget">No members found.</p>}
          <div className="member-grid">
            {people.map((person) => (
              <button type="button" className="member-card" key={person.id} onClick={() => navigate(`/member/${person.id}`)}>
                <UserRound /><span>{person.name}</span>
              </button>
            ))}
          </div>
        </section>
        <CompetitionCard
          competitions={competitions}
          onAdd={addCompetition}
          onDelete={removeCompetition}
          onOpen={() => navigate("/competition")}
          formOpen={competitionFormOpen}
          setFormOpen={setCompetitionFormOpen}
          name={newCompetitionName}
          setName={setNewCompetitionName}
          startDate={newCompetitionStart}
          setStartDate={setNewCompetitionStart}
        />
      </section>
      <section className="tasks-card">
        <header className="tasks-heading">
          <h2><Bell /> Ongoing Tasks Overview</h2>
          <form className="task-add" onSubmit={addTask}>
            <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Add a task" aria-label="New task" required />
            <select className="task-member-input" value={newAssignee} onChange={(event) => setNewAssignee(event.target.value)} aria-label="Assignee">
              <option value="">Unassigned</option>
              {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
            <select value={newPriority} onChange={(event) => setNewPriority(event.target.value)} aria-label="Task priority"><option>High</option><option>Medium</option><option>Low</option></select>
            <input className="task-due-input" type="date" value={newDueDate} onChange={(event) => setNewDueDate(event.target.value)} aria-label="Task due date" />
            <button type="submit" aria-label="Add task" title="Add task"><Plus /></button>
          </form>
        </header>
        <div className="task-table">
          <div className="task-row task-head"><span>Task</span><span>Assigned To</span><span>Priority</span><span>Status</span><span>Due Date</span><span className="task-action-head" /></div>
          {tasksLoading && <p className="empty-widget">Loading tasks...</p>}
          {!tasksLoading && tasks.length === 0 && <p className="empty-widget">No ongoing tasks.</p>}
          {tasks.map((task) => (
            <div className="task-row" key={task.id}>
              <span className="task-name">{task.title}</span>
              <span>{task.assignedTo ? memberNameById.get(task.assignedTo) || "Unknown" : "Unassigned"}</span>
              <span className="priority"><i /> {task.priority}</span>
              <button
                type="button"
                className={`status status-${(task.status || "").toLowerCase().replaceAll(" ", "-")}`}
                onClick={() => cycleStatus(task)}
                disabled={!canManageTask(task)}
              >
                {task.status}
              </button>
              <span>{formatDate(task.dueDate)}</span>
              <button type="button" className="widget-delete" onClick={() => removeTask(task)} disabled={!canManageTask(task)} aria-label={`Delete ${task.title}`} title="Delete task"><Trash2 /></button>
            </div>
          ))}
        </div>
      </section>
      <DashboardExtras />
    </main>
    {notice && <button className="dashboard-toast" onClick={() => setNotice("")}>{notice}<span>x</span></button>}
  </div>;
}