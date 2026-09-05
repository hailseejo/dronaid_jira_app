import { useMemo, useState } from "react";
import DashboardAppBar from "../../components/dashboard/DashboardAppBar";
import "./CompetitionPage.css";

function readList(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? []; } catch { return []; }
}

function formatDate(value) {
  if (!value) return "Date to be confirmed";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CompetitionPage() {
  const [competitions, setCompetitions] = useState(() => readList("dronaid-competitions-v2"));
  const [tasks, setTasks] = useState(() => readList("dronaid-competition-tasks-v2"));
  const [filter, setFilter] = useState("All Competitions");
  const [showCompetitionForm, setShowCompetitionForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [competitionForm, setCompetitionForm] = useState({ name: "", startDate: "", endDate: "", location: "" });
  const [taskForm, setTaskForm] = useState({ subsystem: "", task: "", priority: "Medium", competition: "" });
  const visibleTasks = useMemo(() => filter === "All Competitions" ? tasks : tasks.filter((item) => item.competitionId === filter), [filter, tasks]);
  const completed = tasks.filter((item) => item.complete).length;
  const saveCompetitions = (next) => { setCompetitions(next); localStorage.setItem("dronaid-competitions-v2", JSON.stringify(next)); };
  const saveTasks = (next) => { setTasks(next); localStorage.setItem("dronaid-competition-tasks-v2", JSON.stringify(next)); };
  const toggleTask = (id) => saveTasks(tasks.map((item) => item.id === id ? { ...item, complete: !item.complete } : item));
  const deleteTask = (id) => saveTasks(tasks.filter((item) => item.id !== id));
  const addCompetition = (event) => { event.preventDefault(); if (!competitionForm.name.trim() || !competitionForm.startDate) return; const item = { ...competitionForm, id: crypto.randomUUID(), name: competitionForm.name.trim() }; saveCompetitions([...competitions, item]); setCompetitionForm({ name: "", startDate: "", endDate: "", location: "" }); setShowCompetitionForm(false); };
  const deleteCompetition = (id) => { saveCompetitions(competitions.filter((item) => item.id !== id)); saveTasks(tasks.filter((item) => item.competitionId !== id)); if (filter === id) setFilter("All Competitions"); };
  const addTask = (event) => { event.preventDefault(); if (!taskForm.subsystem.trim() || !taskForm.task.trim() || !taskForm.competition) return; saveTasks([...tasks, { ...taskForm, id: crypto.randomUUID(), subsystem: taskForm.subsystem.trim(), task: taskForm.task.trim(), competitionId: taskForm.competition }]); setTaskForm({ subsystem: "", task: "", priority: "Medium", competition: "" }); setShowTaskForm(false); };

  return <div className="competition-page">
    <DashboardAppBar />
    <main className="competition-content">
      <section className="competition-hero competition-corner-frame">
        <p>COMPETITIONS</p><h1>TEAM COMPETITIONS</h1><span>COMPETE <b>|</b> COLLABORATE <b>|</b> INNOVATE</span><small>AUTONOMY<br />FOR A<br />BETTER TOMORROW</small>
      </section>
      <div className="competition-grid">
        <section className="competition-checklist competition-corner-frame">
          <header className="competition-section-header"><div><h2>COMPETITION CHECKLIST</h2><p>{completed} of {tasks.length} complete</p></div><div className="competition-actions"><button type="button" className="add-button" onClick={() => setShowTaskForm((open) => !open)}>+ Add task</button><label className="competition-filter">Filter<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="All Competitions">All Competitions</option>{competitions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div></header>
          {showTaskForm && <form className="competition-form" onSubmit={addTask}><input placeholder="Subsystem" value={taskForm.subsystem} onChange={(event) => setTaskForm({ ...taskForm, subsystem: event.target.value })} required /><input placeholder="Task details" value={taskForm.task} onChange={(event) => setTaskForm({ ...taskForm, task: event.target.value })} required /><select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}><option>High</option><option>Medium</option><option>Low</option></select><select value={taskForm.competition} onChange={(event) => setTaskForm({ ...taskForm, competition: event.target.value })} required><option value="">Choose competition</option>{competitions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="submit" className="save-button">Save task</button></form>}
          <div className="competition-table" role="table"><div className="competition-row competition-head" role="row"><span /><span>SUBSYSTEM</span><span>TASK</span><span>PRIORITY</span><span /></div>{visibleTasks.map((item) => <div className={`competition-row ${item.complete ? "is-complete" : ""}`} role="row" key={item.id}><input type="checkbox" checked={Boolean(item.complete)} onChange={() => toggleTask(item.id)} aria-label={`Mark ${item.task} complete`} /><span>{item.subsystem}</span><span>{item.task}</span><em className={`priority-${item.priority.toLowerCase()}`}>{item.priority}</em><button type="button" className="delete-button" onClick={() => deleteTask(item.id)} aria-label={`Delete ${item.task}`}>×</button></div>)}{!visibleTasks.length && <p className="competition-empty">No checklist tasks yet. Use “+ Add task” to create one.</p>}</div>
        </section>
        <aside className="competition-dates competition-corner-frame"><header><div><h2>UPCOMING COMPETITION DATES</h2><p>Add events, then link checklist tasks to them.</p></div><button type="button" className="add-button" onClick={() => setShowCompetitionForm((open) => !open)}>+ Add</button></header>{showCompetitionForm && <form className="competition-form dates-form" onSubmit={addCompetition}><input placeholder="Competition name" value={competitionForm.name} onChange={(event) => setCompetitionForm({ ...competitionForm, name: event.target.value })} required /><label>Start date<input type="date" value={competitionForm.startDate} onChange={(event) => setCompetitionForm({ ...competitionForm, startDate: event.target.value })} required /></label><label>End date<input type="date" value={competitionForm.endDate} onChange={(event) => setCompetitionForm({ ...competitionForm, endDate: event.target.value })} /></label><input placeholder="Location (optional)" value={competitionForm.location} onChange={(event) => setCompetitionForm({ ...competitionForm, location: event.target.value })} /><button type="submit" className="save-button">Save competition</button></form>}<div className="timeline">{competitions.map((item) => <div className={`timeline-event ${filter === item.id ? "selected" : ""}`} key={item.id}><button type="button" className="timeline-select" onClick={() => setFilter(item.id)}><i /><span><strong>{item.name}</strong><small>{formatDate(item.startDate)}{item.endDate ? ` - ${formatDate(item.endDate)}` : ""}{item.location ? ` · ${item.location}` : ""}</small></span><b>{filter === item.id ? "Selected" : "Upcoming"}</b></button><button type="button" className="delete-button event-delete" onClick={() => deleteCompetition(item.id)} aria-label={`Delete ${item.name}`}>×</button></div>)}{!competitions.length && <p className="competition-empty">No upcoming competitions. Add your first event above.</p>}</div></aside>
      </div>
    </main>
  </div>;
}
