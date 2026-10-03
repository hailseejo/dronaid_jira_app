import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Plus, Trash2, X } from "lucide-react";

import DashboardAppBar from "../../components/dashboard/DashboardAppBar";
import { useAuthContext } from "../../context/AuthContext";

import {
  createCompetition,
  deleteCompetition as deleteCompetitionDoc,
  createCompetitionChecklistTask,
  updateCompetitionChecklistTask,
  deleteCompetitionChecklistTask,
  subscribeToCompetitions,
  subscribeToCompetitionChecklistTasks,
} from "../../firebase/firestore";

import "./CompetitionPage.css";

function formatDate(value) {
  if (!value) return "Date to be confirmed";

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Date to be confirmed";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CompetitionPage() {
  const { currentUser, isAdmin } = useAuthContext();

  const [competitions, setCompetitions] = useState([]);
  const [tasks, setTasks] = useState([]);

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

  // =====================================================
  // FIRESTORE: COMPETITIONS
  // =====================================================

  useEffect(() => {
    const unsubscribe = subscribeToCompetitions(
      (items) => {
        setCompetitions(items);
      },
      (error) => {
        console.error("Error loading competitions:", error);
      }
    );

    return unsubscribe;
  }, []);

  // =====================================================
  // FIRESTORE: COMPETITION CHECKLIST TASKS
  // =====================================================

  useEffect(() => {
    const unsubscribe = subscribeToCompetitionChecklistTasks(
      (items) => {
        setTasks(items);
      },
      (error) => {
        console.error(
          "Error loading competition checklist tasks:",
          error
        );
      }
    );

    return unsubscribe;
  }, []);

  // =====================================================
  // FILTERED CHECKLIST TASKS
  // =====================================================

  const visibleTasks = useMemo(() => {
    return filter === "All Competitions"
      ? tasks
      : tasks.filter((item) => item.competitionId === filter);
  }, [filter, tasks]);

  // =====================================================
  // COMPLETED TASK COUNT
  // =====================================================

  const completed = tasks.filter((item) => item.complete).length;

  // =====================================================
  // TOGGLE CHECKLIST TASK
  // =====================================================

  const toggleTask = (id) => {
    const item = tasks.find((task) => task.id === id);

    if (!item) return;

    updateCompetitionChecklistTask(id, {
      complete: !item.complete,
    }).catch((err) =>
      console.error("Error updating checklist task:", err)
    );
  };

  // =====================================================
  // DELETE CHECKLIST TASK
  // =====================================================

  const deleteTask = (id) => {
    deleteCompetitionChecklistTask(id).catch((err) =>
      console.error("Error deleting checklist task:", err)
    );
  };

  // =====================================================
  // ADD COMPETITION
  // =====================================================

  const addCompetition = async (event) => {
    event.preventDefault();

    if (
      !competitionForm.name.trim() ||
      !competitionForm.startDate
    ) {
      return;
    }

    try {
      await createCompetition({
        name: competitionForm.name.trim(),
        startDate: competitionForm.startDate,
        endDate: competitionForm.endDate,
        location: competitionForm.location.trim(),
        createdBy: currentUser?.uid,
      });

      setCompetitionForm({
        name: "",
        startDate: "",
        endDate: "",
        location: "",
      });

      setShowCompetitionForm(false);
    } catch (err) {
      console.error("Error creating competition:", err);
    }
  };

  // =====================================================
  // DELETE COMPETITION
  // =====================================================

  const deleteCompetition = async (id) => {
    try {
      await deleteCompetitionDoc(id);

      if (filter === id) {
        setFilter("All Competitions");
      }
    } catch (err) {
      console.error("Error deleting competition:", err);
    }
  };

  // =====================================================
  // ADD CHECKLIST TASK
  // =====================================================

  const addTask = async (event) => {
    event.preventDefault();

    if (
      !taskForm.subsystem.trim() ||
      !taskForm.task.trim() ||
      !taskForm.competition
    ) {
      return;
    }

    try {
      await createCompetitionChecklistTask({
        subsystem: taskForm.subsystem.trim(),
        task: taskForm.task.trim(),
        priority: taskForm.priority,
        competitionId: taskForm.competition,
        createdBy: currentUser?.uid,
      });

      setTaskForm({
        subsystem: "",
        task: "",
        priority: "Medium",
        competition: "",
      });

      setShowTaskForm(false);
    } catch (err) {
      console.error(
        "Error creating competition checklist task:",
        err
      );
    }
  };

  return (
    <div className="competition-page">
      <DashboardAppBar />

      <main className="competition-content">
        <section className="competition-hero competition-corner-frame">
          <p>COMPETITIONS</p>

          <h1>TEAM COMPETITIONS</h1>

          <span>
            COMPETE <b>|</b> COLLABORATE <b>|</b> INNOVATE
          </span>

          <small>
            AUTONOMY
            <br />
            FOR A
            <br />
            BETTER TOMORROW
          </small>
        </section>

        <div className="competition-grid">

          {/* =====================================================
              COMPETITION CHECKLIST
              ===================================================== */}

          <section className="competition-checklist competition-corner-frame">
            <header className="competition-section-header">
              <div>
                <h2>COMPETITION CHECKLIST</h2>

                <p>
                  {completed} of {tasks.length} complete
                </p>
              </div>

              <div className="competition-actions">
                {isAdmin && (
                  <button
                    type="button"
                    className={`add-button ${
                      showTaskForm ? "is-active" : ""
                    }`}
                    onClick={() =>
                      setShowTaskForm((open) => !open)
                    }
                  >
                    {showTaskForm ? (
                      <>
                        <X size={14} />
                        Close
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Add task
                      </>
                    )}
                  </button>
                )}

                <label className="competition-filter">
                  Filter

                  <select
                    value={filter}
                    onChange={(event) =>
                      setFilter(event.target.value)
                    }
                  >
                    <option value="All Competitions">
                      All Competitions
                    </option>

                    {competitions.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </header>

            {/* =====================================================
                ADD CHECKLIST TASK FORM
                ===================================================== */}

            {showTaskForm && (
              <form
                className="competition-form task-form"
                onSubmit={addTask}
              >
                <div className="competition-form-header">
                  <h3>Add Checklist Task</h3>

                  <p>
                    Create a subsystem task linked to a
                    competition
                  </p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="task-subsystem">
                      Subsystem{" "}
                      <span className="label-required">
                        *
                      </span>
                    </label>

                    <input
                      id="task-subsystem"
                      placeholder="e.g. Avionics, Payload, Mechanics"
                      value={taskForm.subsystem}
                      onChange={(event) =>
                        setTaskForm({
                          ...taskForm,
                          subsystem: event.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="task-priority">
                      Priority
                    </label>

                    <select
                      id="task-priority"
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm({
                          ...taskForm,
                          priority: event.target.value,
                        })
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
                    Competition{" "}
                    <span className="label-required">
                      *
                    </span>
                  </label>

                  <select
                    id="task-competition"
                    value={taskForm.competition}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        competition: event.target.value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Choose competition...
                    </option>

                    {competitions.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="task-details">
                    Task Details{" "}
                    <span className="label-required">
                      *
                    </span>
                  </label>

                  <input
                    id="task-details"
                    placeholder="Describe the task or verification step"
                    value={taskForm.task}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        task: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                  >
                    Save Task
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowTaskForm(false);

                      setTaskForm({
                        subsystem: "",
                        task: "",
                        priority: "Medium",
                        competition: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* =====================================================
                CHECKLIST TABLE
                ===================================================== */}

            <div
              className="competition-table"
              role="table"
            >
              <div
                className="competition-row competition-head"
                role="row"
              >
                <span />
                <span>SUBSYSTEM</span>
                <span>TASK</span>
                <span>PRIORITY</span>
                <span />
              </div>

              {visibleTasks.map((item) => (
                <div
                  className={`competition-row ${
                    item.complete ? "is-complete" : ""
                  }`}
                  role="row"
                  key={item.id}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(item.complete)}
                    onChange={() =>
                      isAdmin && toggleTask(item.id)
                    }
                    disabled={!isAdmin}
                    aria-label={`Mark ${item.task} complete`}
                  />

                  <span className="task-subsystem">
                    {item.subsystem}
                  </span>

                  <span className="task-desc">
                    {item.task}
                  </span>

                  <em
                    className={`priority-${(
                      item.priority || "Medium"
                    ).toLowerCase()}`}
                  >
                    {item.priority || "Medium"}
                  </em>

                  {isAdmin && (
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        deleteTask(item.id)
                      }
                      aria-label={`Delete ${item.task}`}
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              {!visibleTasks.length && (
                <p className="competition-empty">
                  No checklist tasks yet. Use “+ Add task”
                  to create one.
                </p>
              )}
            </div>
          </section>

          {/* =====================================================
              UPCOMING COMPETITION DATES
              ===================================================== */}

          <aside className="competition-dates competition-corner-frame">
            <header className="dates-header">
              <div>
                <h2>UPCOMING COMPETITION DATES</h2>

                <p>
                  Add events, then link checklist tasks to
                  them.
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  className={`add-button ${
                    showCompetitionForm ? "is-active" : ""
                  }`}
                  onClick={() =>
                    setShowCompetitionForm(
                      (open) => !open
                    )
                  }
                >
                  {showCompetitionForm ? (
                    <>
                      <X size={14} />
                      Close
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Add
                    </>
                  )}
                </button>
              )}
            </header>

            {/* =====================================================
                ADD COMPETITION FORM
                ===================================================== */}

            {showCompetitionForm && (
              <form
                className="competition-form dates-form"
                onSubmit={addCompetition}
              >
                <div className="competition-form-header">
                  <h3>Add New Competition</h3>

                  <p>
                    Schedule a competition and define its
                    timeline
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="comp-name">
                    Competition Name{" "}
                    <span className="label-required">
                      *
                    </span>
                  </label>

                  <input
                    id="comp-name"
                    placeholder="e.g. UAS Autonomous Challenge 2026"
                    value={competitionForm.name}
                    onChange={(event) =>
                      setCompetitionForm({
                        ...competitionForm,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="comp-start">
                      Start Date{" "}
                      <span className="label-required">
                        *
                      </span>
                    </label>

                    <input
                      id="comp-start"
                      type="date"
                      value={competitionForm.startDate}
                      onChange={(event) =>
                        setCompetitionForm({
                          ...competitionForm,
                          startDate:
                            event.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="comp-end">
                      End Date{" "}
                      <span className="label-optional">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="comp-end"
                      type="date"
                      value={competitionForm.endDate}
                      onChange={(event) =>
                        setCompetitionForm({
                          ...competitionForm,
                          endDate:
                            event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comp-location">
                    Location{" "}
                    <span className="label-optional">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="comp-location"
                    placeholder="e.g. Bangalore, South India"
                    value={competitionForm.location}
                    onChange={(event) =>
                      setCompetitionForm({
                        ...competitionForm,
                        location:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                  >
                    Save Competition
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowCompetitionForm(false);

                      setCompetitionForm({
                        name: "",
                        startDate: "",
                        endDate: "",
                        location: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* =====================================================
                COMPETITION TIMELINE
                ===================================================== */}

            <div className="timeline">
              {competitions.map((item) => (
                <div
                  className={`timeline-event ${
                    filter === item.id
                      ? "selected"
                      : ""
                  }`}
                  key={item.id}
                >
                  <button
                    type="button"
                    className="timeline-select"
                    onClick={() =>
                      setFilter(
                        filter === item.id
                          ? "All Competitions"
                          : item.id
                      )
                    }
                    title={`Click to filter tasks by ${item.name}`}
                  >
                    <span className="timeline-marker-wrap">
                      <i className="timeline-marker" />
                    </span>

                    <div className="timeline-info">
                      <div className="timeline-info-top">
                        <strong className="timeline-name">
                          {item.name}
                        </strong>

                        <span
                          className={`timeline-status ${
                            filter === item.id
                              ? "status-selected"
                              : "status-upcoming"
                          }`}
                        >
                          {filter === item.id
                            ? "Selected"
                            : "Upcoming"}
                        </span>
                      </div>

                      <div className="timeline-meta">
                        <span className="timeline-date">
                          <CalendarDays
                            size={13}
                            className="meta-icon"
                          />

                          {formatDate(item.startDate)}

                          {item.endDate
                            ? ` – ${formatDate(
                                item.endDate
                              )}`
                            : ""}
                        </span>

                        {item.location && (
                          <span className="timeline-location">
                            <MapPin
                              size={13}
                              className="meta-icon"
                            />

                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {isAdmin && (
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
                  )}
                </div>
              ))}

              {!competitions.length && (
                <p className="competition-empty">
                  No upcoming competitions. Add your first
                  event above.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}