import { useMemo, useState } from "react";
import { CalendarDays, MapPin, Plus, Trash2, X } from "lucide-react";
import DashboardAppBar from "../../components/dashboard/DashboardAppBar";
import "./CompetitionPage.css";

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
}

function formatDate(value) {
  if (!value) return "Date to be confirmed";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CompetitionPage() {
  const [competitions, setCompetitions] = useState(() => readList("dronaid-competitions-v2"));
  const [tasks, setTasks] = useState(() => readList("dronaid-competition-tasks-v2"));
  const [filter, setFilter] = useState("All Competitions");
  const [showCompetitionForm, setShowCompetitionForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [competitionForm, setCompetitionForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
  });
  const [taskForm, setTaskForm] = useState({
    subsystem: "",
    task: "",
    priority: "Medium",
    competition: "",
  });

  const visibleTasks = useMemo(() => {
    return filter === "All Competitions"
      ? tasks
      : tasks.filter((item) => item.competitionId === filter);
  }, [filter, tasks]);

  const completed = tasks.filter((item) => item.complete).length;

  const saveCompetitions = (next) => {
    setCompetitions(next);
    localStorage.setItem("dronaid-competitions-v2", JSON.stringify(next));
  };

  const saveTasks = (next) => {
    setTasks(next);
    localStorage.setItem("dronaid-competition-tasks-v2", JSON.stringify(next));
  };

  const toggleTask = (id) => {
    saveTasks(
      tasks.map((item) =>
        item.id === id ? { ...item, complete: !item.complete } : item
      )
    );
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter((item) => item.id !== id));
  };

  const addCompetition = (event) => {
    event.preventDefault();
    if (!competitionForm.name.trim() || !competitionForm.startDate) return;
    const item = {
      ...competitionForm,
      id: crypto.randomUUID(),
      name: competitionForm.name.trim(),
    };
    saveCompetitions([...competitions, item]);
    setCompetitionForm({ name: "", startDate: "", endDate: "", location: "" });
    setShowCompetitionForm(false);
  };

  const deleteCompetition = (id) => {
    saveCompetitions(competitions.filter((item) => item.id !== id));
    saveTasks(tasks.filter((item) => item.competitionId !== id));
    if (filter === id) setFilter("All Competitions");
  };

  const addTask = (event) => {
    event.preventDefault();
    if (!taskForm.subsystem.trim() || !taskForm.task.trim() || !taskForm.competition) return;
    saveTasks([
      ...tasks,
      {
        ...taskForm,
        id: crypto.randomUUID(),
        subsystem: taskForm.subsystem.trim(),
        task: taskForm.task.trim(),
        competitionId: taskForm.competition,
      },
    ]);
    setTaskForm({ subsystem: "", task: "", priority: "Medium", competition: "" });
    setShowTaskForm(false);
  };

  return (
    <div className="competition-page">
      <DashboardAppBar />
      <main className="competition-content">
        <section className="competition-hero competition-corner-frame">
          <p>COMPETITIONS</p>
          <h1>TEAM COMPETITIONS</h1>
          <span>COMPETE <b>|</b> COLLABORATE <b>|</b> INNOVATE</span>
          <small>
            AUTONOMY<br />FOR A<br />BETTER TOMORROW
          </small>
        </section>

        <div className="competition-grid">
          <section className="competition-checklist competition-corner-frame">
            <header className="competition-section-header">
              <div>
                <h2>COMPETITION CHECKLIST</h2>
                <p>{completed} of {tasks.length} complete</p>
              </div>
              <div className="competition-actions">
                <button
                  type="button"
                  className={`add-button ${showTaskForm ? "is-active" : ""}`}
                  onClick={() => setShowTaskForm((open) => !open)}
                >
                  {showTaskForm ? (
                    <>
                      <X size={14} /> Close
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add task
                    </>
                  )}
                </button>
                <label className="competition-filter">
                  Filter
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                  >
                    <option value="All Competitions">All Competitions</option>
                    {competitions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </header>

            {showTaskForm && (
              <form className="competition-form task-form" onSubmit={addTask}>
                <div className="competition-form-header">
                  <h3>Add Checklist Task</h3>
                  <p>Create a subsystem task linked to a competition</p>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="task-subsystem">
                      Subsystem <span className="label-required">*</span>
                    </label>
                    <input
                      id="task-subsystem"
                      placeholder="e.g. Avionics, Payload, Mechanics"
                      value={taskForm.subsystem}
                      onChange={(event) =>
                        setTaskForm({ ...taskForm, subsystem: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="task-priority">Priority</label>
                    <select
                      id="task-priority"
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm({ ...taskForm, priority: event.target.value })
                      }
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="task-competition">
                    Competition <span className="label-required">*</span>
                  </label>
                  <select
                    id="task-competition"
                    value={taskForm.competition}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, competition: event.target.value })
                    }
                    required
                  >
                    <option value="">Choose competition...</option>
                    {competitions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="task-details">
                    Task Details <span className="label-required">*</span>
                  </label>
                  <input
                    id="task-details"
                    placeholder="Describe the task or verification step"
                    value={taskForm.task}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, task: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Save Task
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowTaskForm(false);
                      setTaskForm({ subsystem: "", task: "", priority: "Medium", competition: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="competition-table" role="table">
              <div className="competition-row competition-head" role="row">
                <span />
                <span>SUBSYSTEM</span>
                <span>TASK</span>
                <span>PRIORITY</span>
                <span />
              </div>
              {visibleTasks.map((item) => (
                <div
                  className={`competition-row ${item.complete ? "is-complete" : ""}`}
                  role="row"
                  key={item.id}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(item.complete)}
                    onChange={() => toggleTask(item.id)}
                    aria-label={`Mark ${item.task} complete`}
                  />
                  <span className="task-subsystem">{item.subsystem}</span>
                  <span className="task-desc">{item.task}</span>
                  <em className={`priority-${item.priority.toLowerCase()}`}>
                    {item.priority}
                  </em>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteTask(item.id)}
                    aria-label={`Delete ${item.task}`}
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {!visibleTasks.length && (
                <p className="competition-empty">
                  No checklist tasks yet. Use “+ Add task” to create one.
                </p>
              )}
            </div>
          </section>

          <aside className="competition-dates competition-corner-frame">
            <header className="dates-header">
              <div>
                <h2>UPCOMING COMPETITION DATES</h2>
                <p>Add events, then link checklist tasks to them.</p>
              </div>
              <button
                type="button"
                className={`add-button ${showCompetitionForm ? "is-active" : ""}`}
                onClick={() => setShowCompetitionForm((open) => !open)}
              >
                {showCompetitionForm ? (
                  <>
                    <X size={14} /> Close
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add
                  </>
                )}
              </button>
            </header>

            {showCompetitionForm && (
              <form className="competition-form dates-form" onSubmit={addCompetition}>
                <div className="competition-form-header">
                  <h3>Add New Competition</h3>
                  <p>Schedule a competition and define its timeline</p>
                </div>
                <div className="form-group">
                  <label htmlFor="comp-name">
                    Competition Name <span className="label-required">*</span>
                  </label>
                  <input
                    id="comp-name"
                    placeholder="e.g. UAS Autonomous Challenge 2026"
                    value={competitionForm.name}
                    onChange={(event) =>
                      setCompetitionForm({ ...competitionForm, name: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="comp-start">
                      Start Date <span className="label-required">*</span>
                    </label>
                    <input
                      id="comp-start"
                      type="date"
                      value={competitionForm.startDate}
                      onChange={(event) =>
                        setCompetitionForm({ ...competitionForm, startDate: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="comp-end">
                      End Date <span className="label-optional">(optional)</span>
                    </label>
                    <input
                      id="comp-end"
                      type="date"
                      value={competitionForm.endDate}
                      onChange={(event) =>
                        setCompetitionForm({ ...competitionForm, endDate: event.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="comp-location">
                    Location <span className="label-optional">(optional)</span>
                  </label>
                  <input
                    id="comp-location"
                    placeholder="e.g. Bangalore, South India"
                    value={competitionForm.location}
                    onChange={(event) =>
                      setCompetitionForm({ ...competitionForm, location: event.target.value })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Save Competition
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowCompetitionForm(false);
                      setCompetitionForm({ name: "", startDate: "", endDate: "", location: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="timeline">
              {competitions.map((item) => (
                <div
                  className={`timeline-event ${filter === item.id ? "selected" : ""}`}
                  key={item.id}
                >
                  <button
                    type="button"
                    className="timeline-select"
                    onClick={() =>
                      setFilter(filter === item.id ? "All Competitions" : item.id)
                    }
                    title={`Click to filter tasks by ${item.name}`}
                  >
                    <span className="timeline-marker-wrap">
                      <i className="timeline-marker" />
                    </span>
                    <div className="timeline-info">
                      <div className="timeline-info-top">
                        <strong className="timeline-name">{item.name}</strong>
                        <span
                          className={`timeline-status ${
                            filter === item.id ? "status-selected" : "status-upcoming"
                          }`}
                        >
                          {filter === item.id ? "Selected" : "Upcoming"}
                        </span>
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-date">
                          <CalendarDays size={13} className="meta-icon" />
                          {formatDate(item.startDate)}
                          {item.endDate ? ` – ${formatDate(item.endDate)}` : ""}
                        </span>
                        {item.location && (
                          <span className="timeline-location">
                            <MapPin size={13} className="meta-icon" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="delete-button event-delete"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteCompetition(item.id);
                    }}
                    aria-label={`Delete ${item.name}`}
                    title={`Delete ${item.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {!competitions.length && (
                <p className="competition-empty">
                  No upcoming competitions. Add your first event above.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
