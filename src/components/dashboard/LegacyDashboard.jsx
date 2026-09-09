import { useMemo, useState } from "react";
import "./LegacyDashboard.css";
import DashboardAppBar from "./DashboardAppBar";
import { useAuthContext } from "../../context/AuthContext";
import {
  useMemberTasks,
  useSubsystemMemberTasks,
  useCreateTask,
  canManageSubsystemTasks,
  updateTaskStatus,
  deleteTask,
} from "../../hooks/useTasks";

// =====================================================
// ICONS
// =====================================================

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.5-4.2 3.2-6.5 8-6.5s7.5 2.3 8 6.5" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20c.5-3.3 2.5-5 5.5-5s5 1.7 5.5 5" />
      <path d="M14 15.5c2.8-.2 5 1.5 5.5 4.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="arrow-icon">
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

// =====================================================
// DRONE
// =====================================================

function Drone({ flip = false }) {
  return (
    <div className={`drone ${flip ? "flip" : ""}`}>
      <svg viewBox="0 0 320 260" className="drone-svg">

        {/* LEFT PROPELLER */}
        <g className="drone-line">
          <ellipse cx="65" cy="50" rx="45" ry="7" />
          <ellipse cx="65" cy="50" rx="7" ry="45" />
        </g>

        {/* RIGHT PROPELLER */}
        <g className="drone-line">
          <ellipse cx="255" cy="50" rx="45" ry="7" />
          <ellipse cx="255" cy="50" rx="7" ry="45" />
        </g>

        {/* DRONE BODY */}
        <g className="drone-line">
          <path d="M65 50 L120 100 L160 110 L200 100 L255 50" />

          <path d="M65 50 L110 155 L140 175 L180 175 L210 155 L255 50" />

          <path d="M120 100 L110 155" />
          <path d="M200 100 L210 155" />

          <path d="M140 175 L138 205" />
          <path d="M180 175 L182 205" />
        </g>

        {/* CENTER BODY */}
        <g className="drone-line">
          <path d="M110 105 L138 92 L182 92 L210 105" />
          <path d="M110 105 L138 145 L182 145 L210 105" />

          <path d="M138 145 V175" />
          <path d="M182 145 V175" />

          {/* Lights */}
          <circle cx="138" cy="175" r="3" />
          <circle cx="150" cy="175" r="3" />
          <circle cx="162" cy="175" r="3" />
          <circle cx="174" cy="175" r="3" />
        </g>

        {/* CAMERA */}
        <g className="drone-line">
          <path d="M138 185v20" />
          <path d="M182 185v20" />

          <rect
            x="132"
            y="202"
            width="56"
            height="38"
            rx="9"
          />

          <circle
            cx="160"
            cy="221"
            r="11"
          />

          <circle
            cx="160"
            cy="221"
            r="5"
          />
        </g>

      </svg>
    </div>
  );
}

// =====================================================
// LOCAL STORAGE HELPERS (still used for team-wide /team
// and /workspace-dashboard views, and for the Dependent
// card, which has no Firebase structure yet)
// =====================================================

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

// Firestore Timestamp, JS Date, or "YYYY-MM-DD" string -> "Due: 04 Sep 2026".
function formatDueDate(value) {
  if (!value) return "No due date";
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "No due date";
  return `Due: ${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
}

// =====================================================
// TODO ITEM
// =====================================================

function TodoItem({ task, onDelete }) {
  return (
    <div className="todo-item">
      <div className="todo-name">
        {task.title}
      </div>

      <div className="todo-date">
        <span className={`priority-dot ${task.priority}`}></span>

        {task.date}

        <button
          type="button"
          className="team-delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Same visual shape as TodoItem, but for a Firestore task (real
// priority/dueDate fields, and a delete button that's hidden entirely
// when the viewer isn't allowed to delete it rather than a no-op click).
function FirebaseTodoItem({ task, canDelete, onDelete }) {
  return (
    <div className="todo-item">
      <div className="todo-name">
        {task.title}
      </div>

      <div className="todo-date">
        <span className={`priority-dot ${(task.priority || "medium").toLowerCase()}`}></span>

        {formatDueDate(task.dueDate)}

        {canDelete && (
          <button
            type="button"
            className="team-delete"
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN DASHBOARD
// =====================================================

// When rendered from a specific member's page (via MemberPage.jsx),
// memberId + memberProfile are provided and the greeting, profile card,
// To do / In Progress cards, and Upcoming Deadlines become Firebase-backed
// and scoped to that one member. When rendered with no props (the /team
// and /workspace-dashboard routes), every one of those sections falls back
// to the original, unchanged local-storage-backed team-wide behaviour.
export default function LegacyDashboard({ memberId, memberProfile }) {
  const isMemberMode = Boolean(memberId);

  // ---- VIEWER (the logged-in person looking at this page) ----
  const { currentUser, userProfile, isAdmin } = useAuthContext();
  const createFirebaseTask = useCreateTask({ userProfile, currentUser });

  const isOwnPage = isMemberMode && currentUser?.uid === memberId;

  // A regular member viewing a TEAMMATE's page can't use the same query an
  // Admin or the member themself can (see subscribeToSubsystemMemberTasks
  // in firestore.js for why) — pick whichever query shape is actually
  // authorized for this viewer/target combination. Both hooks are always
  // called (React hooks rules); whichever one isn't relevant for this
  // viewer is passed a null argument and returns an empty, inert result.
  const canManageMemberTasks = canManageSubsystemTasks(userProfile, memberProfile?.subsystem);
  const ownOrAdminTasks = useMemberTasks(isMemberMode && (isOwnPage || isAdmin) ? memberId : null);
  const teammateTasks = useSubsystemMemberTasks(
    isMemberMode && !isOwnPage && !isAdmin && canManageMemberTasks ? memberProfile?.subsystem : null,
    isMemberMode && !isOwnPage && !isAdmin && canManageMemberTasks ? memberId : null
  );

  const memberTasks = isOwnPage || isAdmin ? ownOrAdminTasks.tasks : teammateTasks.tasks;
  const memberTasksLoading = isOwnPage || isAdmin ? ownOrAdminTasks.loading : teammateTasks.loading;
  const memberTasksError = isOwnPage || isAdmin ? ownOrAdminTasks.error : teammateTasks.error;

  // Task creation/update logic already used elsewhere in this project only
  // recognises these exact status strings: a newly-created task always
  // starts as "Ongoing", and cycling moves it through "In Progress" and
  // "Done". "Ongoing" is this project's "not started yet" bucket, so it's
  // what the "To do" card maps to — no new status value is introduced.
  const firebaseTodoTasks = useMemo(
    () => memberTasks.filter((task) => task.status === "Ongoing"),
    [memberTasks]
  );
  const firebaseProgressTasks = useMemo(
    () => memberTasks.filter((task) => task.status === "In Progress"),
    [memberTasks]
  );

  // Derived directly from the same task data — never a separate collection.
  // Only tasks that are still open (Ongoing or In Progress) and have a due
  // date are shown, nearest date first.
  const firebaseDeadlines = useMemo(() => {
    return memberTasks
      .filter((task) => (task.status === "Ongoing" || task.status === "In Progress") && task.dueDate)
      .slice()
      .sort((a, b) => (a.dueDate?.toMillis?.() || 0) - (b.dueDate?.toMillis?.() || 0));
  }, [memberTasks]);

  const canManageFirebaseTask = (task) =>
    canManageSubsystemTasks(userProfile, task.subsystem || memberProfile?.subsystem);
  const canCreateMemberTask = canManageSubsystemTasks(userProfile, memberProfile?.subsystem);

  // ---- LOCAL, team-wide state (unchanged) — used when NOT viewing a
  // specific member's page ----
  const [todoTasks, setTodoTasks] = useState(() =>
    readStoredList("dronaid-team-todos")
  );

  const [progressTasks, setProgressTasks] = useState(() =>
    readStoredList("dronaid-team-progress")
  );

  const [teamDeadlines, setTeamDeadlines] = useState(() =>
    readStoredList("dronaid-team-deadlines")
  );

  // Dependencies have no Firebase structure anywhere in this project, so
  // they stay local-storage-backed in every mode, per-member-scoped when
  // viewing a specific member's page so different members' pages don't
  // share one browser's local list.
  const dependencyStorageKey = isMemberMode
    ? `dronaid-member-dependencies-${memberId}`
    : "dronaid-team-dependencies";

  const [dependencies, setDependencies] = useState(() =>
    readStoredList(dependencyStorageKey)
  );

  const [openForm, setOpenForm] = useState("");

  const [todoForm, setTodoForm] = useState({
    title: "",
    date: "",
    priority: "medium",
  });

  const [progressTitle, setProgressTitle] = useState("");

  const [dependencyForm, setDependencyForm] = useState({
    title: "",
    member: "",
    date: "",
  });

  const [teamDeadlineForm, setTeamDeadlineForm] = useState({
    title: "",
    date: "",
  });

  // =====================================================
  // UPDATE LOCAL STORAGE
  // =====================================================

  const updateList = (key, setter, list) => {
    setter(list);
    saveList(key, list);
  };

  // =====================================================
  // ADD TODO
  // =====================================================

  const addTodo = (event) => {
    event.preventDefault();

    if (!todoForm.title.trim() || !todoForm.date) {
      return;
    }

    if (isMemberMode) {
      createFirebaseTask({
        title: todoForm.title.trim(),
        assignedTo: memberId,
        subsystem: memberProfile?.subsystem,
        priority: todoForm.priority.charAt(0).toUpperCase() + todoForm.priority.slice(1),
        dueDate: todoForm.date,
      }).catch((err) => console.error("Error creating task:", err));
    } else {
      const newTask = {
        ...todoForm,
        id: crypto.randomUUID(),
        title: todoForm.title.trim(),
        date: `Due: ${todoForm.date}`,
      };

      updateList(
        "dronaid-team-todos",
        setTodoTasks,
        [newTask, ...todoTasks]
      );
    }

    setTodoForm({
      title: "",
      date: "",
      priority: "medium",
    });

    setOpenForm("");
  };

  // =====================================================
  // ADD PROGRESS TASK
  // =====================================================

  const addProgress = (event) => {
    event.preventDefault();

    if (!progressTitle.trim()) {
      return;
    }

    if (isMemberMode) {
      // createTask always starts a task as "Ongoing" (see firestore.js) —
      // immediately bump it to "In Progress" using the existing status
      // update function rather than inventing a second creation path.
      createFirebaseTask({
        title: progressTitle.trim(),
        assignedTo: memberId,
        subsystem: memberProfile?.subsystem,
        priority: "Medium",
      })
        .then((docRef) => updateTaskStatus(docRef.id, "In Progress"))
        .catch((err) => console.error("Error creating task:", err));
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        title: progressTitle.trim(),
      };

      updateList(
        "dronaid-team-progress",
        setProgressTasks,
        [newTask, ...progressTasks]
      );
    }

    setProgressTitle("");
    setOpenForm("");
  };

  // =====================================================
  // ADD DEPENDENCY (unchanged local behaviour)
  // =====================================================

  const addDependency = (event) => {
    event.preventDefault();

    if (!dependencyForm.title.trim()) {
      return;
    }

    const newDependency = {
      ...dependencyForm,
      id: crypto.randomUUID(),
      title: dependencyForm.title.trim(),
      member: dependencyForm.member.trim(),
      date: dependencyForm.date
        ? `Due: ${dependencyForm.date}`
        : "",
    };

    updateList(
      dependencyStorageKey,
      setDependencies,
      [newDependency, ...dependencies]
    );

    setDependencyForm({
      title: "",
      member: "",
      date: "",
    });

    setOpenForm("");
  };

  // =====================================================
  // ADD DEADLINE (local/team mode only — Firebase mode
  // derives deadlines automatically from tasks)
  // =====================================================

  const addTeamDeadline = (event) => {
    event.preventDefault();

    if (
      !teamDeadlineForm.title.trim() ||
      !teamDeadlineForm.date
    ) {
      return;
    }

    const newDeadline = {
      ...teamDeadlineForm,
      id: crypto.randomUUID(),
      title: teamDeadlineForm.title.trim(),
    };

    updateList(
      "dronaid-team-deadlines",
      setTeamDeadlines,
      [newDeadline, ...teamDeadlines]
    );

    setTeamDeadlineForm({
      title: "",
      date: "",
    });

    setOpenForm("");
  };

  // =====================================================
  // DELETE (local)
  // =====================================================

  const deleteItem = (key, setter, list, id) => {
    updateList(
      key,
      setter,
      list.filter((item) => item.id !== id)
    );
  };

  // =====================================================
  // DELETE (Firebase task)
  // =====================================================

  const deleteFirebaseTask = (task) => {
    if (!canManageFirebaseTask(task)) return;
    deleteTask(task.id).catch((err) => console.error("Error deleting task:", err));
  };

  // =====================================================
  // DISPLAY VALUES
  // =====================================================

  const greetingName = isMemberMode ? memberProfile?.name || "Member" : "Name";
  const displaySubsystem = isMemberMode ? memberProfile?.subsystem || "—" : "Avionics";
  const displayRole = isMemberMode ? memberProfile?.role || "—" : "Subsystem Lead";

  const todoCount = isMemberMode ? firebaseTodoTasks.length : todoTasks.length;
  const progressCount = isMemberMode ? firebaseProgressTasks.length : progressTasks.length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="dashboard">

      {/* BACKGROUND */}
      <div className="grid-background"></div>

      <div className="purple-glow glow-one"></div>

      <div className="purple-glow glow-two"></div>

      <DashboardAppBar />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main legacy-main">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <aside className="left-side">

          {/* FLIGHT DATA */}

          <div className="flight-data">

            <div>
              ALT : <span>120M</span>
            </div>

            <div>
              SPD : <span>18.4 M/S</span>
            </div>

            <div>
              BAT : <span>76%</span>
            </div>

          </div>

          {/* DRONE */}

          <Drone />

          <span className="decorative-plus plus-left">
            +
          </span>

          <span className="decorative-plus plus-bottom">
            +
          </span>

        </aside>

        {/* =================================================
            CENTER
        ================================================= */}

        <section className="center">

          {/* GREETING */}

          <div className="greeting">

            <h1>
              Hi, {greetingName}
            </h1>

            <p>
              Here's what's happening today.
            </p>

          </div>

          {/* =================================================
              CARDS
          ================================================= */}

          <div className="cards">

            {/* =================================================
                TO DO CARD
            ================================================= */}

            <div className="card">

              <div className="card-heading">

                <span className="card-icon">
                  <TaskIcon />
                </span>

                <span>
                  To do ({todoCount})
                </span>

                {(!isMemberMode || canCreateMemberTask) && <button
                  type="button"
                  className="team-add"
                  onClick={() =>
                    setOpenForm(
                      openForm === "todo"
                        ? ""
                        : "todo"
                    )
                  }
                >
                  + Add
                </button>}

              </div>

              {openForm === "todo" && (
                <form
                  className="team-form"
                  onSubmit={addTodo}
                >

                  <input
                    placeholder="Task name"
                    value={todoForm.title}
                    onChange={(event) =>
                      setTodoForm({
                        ...todoForm,
                        title: event.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="date"
                    aria-label="Task due date"
                    value={todoForm.date}
                    onChange={(event) =>
                      setTodoForm({
                        ...todoForm,
                        date: event.target.value,
                      })
                    }
                    required
                  />

                  <select
                    aria-label="Task priority"
                    value={todoForm.priority}
                    onChange={(event) =>
                      setTodoForm({
                        ...todoForm,
                        priority: event.target.value,
                      })
                    }
                  >
                    <option value="urgent">
                      Urgent
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="low">
                      Low
                    </option>
                  </select>

                  <button type="submit">
                    Save
                  </button>

                </form>
              )}

              <div className="task-list">

                {isMemberMode ? (
                  memberTasksLoading ? (
                    <p className="team-empty">Loading tasks...</p>
                  ) : memberTasksError ? (
                    <p className="team-empty">Unable to load tasks right now.</p>
                  ) : firebaseTodoTasks.length ? (
                    firebaseTodoTasks.map((task) => (
                      <FirebaseTodoItem
                        key={task.id}
                        task={task}
                        canDelete={canManageFirebaseTask(task)}
                        onDelete={deleteFirebaseTask}
                      />
                    ))
                  ) : (
                    <p className="team-empty">
                      No tasks yet.
                    </p>
                  )
                ) : todoTasks.length ? (
                  todoTasks.map((task, index) => (
                    <TodoItem
                      key={task.id || index}
                      task={task}
                      onDelete={(id) =>
                        deleteItem(
                          "dronaid-team-todos",
                          setTodoTasks,
                          todoTasks,
                          id
                        )
                      }
                    />
                  ))
                ) : (
                  <p className="team-empty">
                    No tasks yet.
                  </p>
                )}

              </div>

              <button
                type="button"
                className="view-all"
              >
                <span>
                  View All Tasks
                </span>

                <ArrowIcon />
              </button>

            </div>

            {/* =================================================
                IN PROGRESS CARD
            ================================================= */}

            <div className="card">

              <div className="card-heading">

                <span className="card-icon">
                  <ClockIcon />
                </span>

                <span>
                  In Progress ({progressCount})
                </span>

                {(!isMemberMode || canCreateMemberTask) && <button
                  type="button"
                  className="team-add"
                  onClick={() =>
                    setOpenForm(
                      openForm === "progress"
                        ? ""
                        : "progress"
                    )
                  }
                >
                  + Add
                </button>}

              </div>

              {openForm === "progress" && (
                <form
                  className="team-form"
                  onSubmit={addProgress}
                >

                  <input
                    placeholder="Task name"
                    value={progressTitle}
                    onChange={(event) =>
                      setProgressTitle(
                        event.target.value
                      )
                    }
                    required
                  />

                  <button type="submit">
                    Save
                  </button>

                </form>
              )}

              <div className="task-list">

                {isMemberMode ? (
                  memberTasksLoading ? (
                    <p className="team-empty">Loading tasks...</p>
                  ) : memberTasksError ? (
                    <p className="team-empty">Unable to load tasks right now.</p>
                  ) : firebaseProgressTasks.length ? (
                    firebaseProgressTasks.map((task) => (
                      <div className="progress-item" key={task.id}>
                        {task.title}

                        {canManageFirebaseTask(task) && (
                          <button
                            type="button"
                            className="team-delete"
                            onClick={() => deleteFirebaseTask(task)}
                            aria-label={`Delete ${task.title}`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="team-empty">
                      No tasks in progress.
                    </p>
                  )
                ) : progressTasks.length ? (
                  progressTasks.map((task, index) => (
                    <div
                      className="progress-item"
                      key={task.id || index}
                    >

                      {task.title || task}

                      <button
                        type="button"
                        className="team-delete"
                        onClick={() =>
                          deleteItem(
                            "dronaid-team-progress",
                            setProgressTasks,
                            progressTasks,
                            task.id
                          )
                        }
                        aria-label={`Delete ${
                          task.title || task
                        }`}
                      >
                        ×
                      </button>

                    </div>
                  ))
                ) : (
                  <p className="team-empty">
                    No tasks in progress.
                  </p>
                )}

              </div>

              <button
                type="button"
                className="view-all"
              >
                <span>
                  View All Tasks
                </span>

                <ArrowIcon />
              </button>

            </div>

            {/* =================================================
                DEPENDENT CARD (still local — no Firebase
                dependency structure exists in this project)
            ================================================= */}

            <div className="card">

              <div className="card-heading">

                <span className="card-icon">
                  <TeamIcon />
                </span>

                <span>
                  Dependent ({dependencies.length})
                </span>

                <button
                  type="button"
                  className="team-add"
                  onClick={() =>
                    setOpenForm(
                      openForm === "dependency"
                        ? ""
                        : "dependency"
                    )
                  }
                >
                  + Add
                </button>

              </div>

              {openForm === "dependency" && (
                <form
                  className="team-form"
                  onSubmit={addDependency}
                >

                  <input
                    placeholder="Dependency name"
                    value={dependencyForm.title}
                    onChange={(event) =>
                      setDependencyForm({
                        ...dependencyForm,
                        title: event.target.value,
                      })
                    }
                    required
                  />

                  <input
                    placeholder="Member"
                    value={dependencyForm.member}
                    onChange={(event) =>
                      setDependencyForm({
                        ...dependencyForm,
                        member: event.target.value,
                      })
                    }
                  />

                  <input
                    type="date"
                    aria-label="Dependency due date"
                    value={dependencyForm.date}
                    onChange={(event) =>
                      setDependencyForm({
                        ...dependencyForm,
                        date: event.target.value,
                      })
                    }
                  />

                  <button type="submit">
                    Save
                  </button>

                </form>
              )}

              <div className="dependency-list">

                {dependencies.length ? (
                  dependencies.map(
                    (dependency, index) => (
                      <div
                        className="dependency-item"
                        key={
                          dependency.id || index
                        }
                      >

                        <div className="waiting">
                          Waiting for:
                        </div>

                        <div className="dependency-title">
                          {dependency.title}
                        </div>

                        <div className="dependency-member">
                          {dependency.member}
                        </div>

                        <div className="dependency-date">
                          {dependency.date}
                        </div>

                        <button
                          type="button"
                          className="team-delete dependency-delete"
                          onClick={() =>
                            deleteItem(
                              dependencyStorageKey,
                              setDependencies,
                              dependencies,
                              dependency.id
                            )
                          }
                          aria-label={`Delete ${dependency.title}`}
                        >
                          ×
                        </button>

                      </div>
                    )
                  )
                ) : (
                  <p className="team-empty">
                    No dependencies yet.
                  </p>
                )}

              </div>

              <button
                type="button"
                className="view-all"
              >
                <span>
                  View All Dependencies
                </span>

                <ArrowIcon />
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <aside className="right-side">

          {/* PROFILE */}

          <div className="profile-card">

            <div className="profile-symbol">
              <UserIcon />
            </div>

            <div className="profile-info">

              <div>
                <span>Name:</span>
                <strong>{greetingName}</strong>
              </div>

              <div>
                <span>Subsystem:</span>
                <strong>{displaySubsystem}</strong>
              </div>

              <div>
                <span>Role:</span>
                <strong>{displayRole}</strong>
              </div>

            </div>

          </div>

          {/* PRIORITY */}

          <div className="side-card">

            <h2>
              Priority Order
            </h2>

            <div className="priority-list">

              <div>
                <span className="priority-dot urgent"></span>
                Urgent
              </div>

              <div>
                <span className="priority-dot high"></span>
                High
              </div>

              <div>
                <span className="priority-dot medium"></span>
                Medium
              </div>

              <div>
                <span className="priority-dot low"></span>
                Low
              </div>

            </div>

          </div>

          {/* DEADLINES */}

          <div className="side-card deadlines">

            <div className="deadline-heading">

              <h2>
                Upcoming Deadlines
              </h2>

              {/* Firebase mode derives deadlines automatically from To do
                  / In Progress tasks, so there is nothing to manually add
                  there — the +Add form only applies to team/local mode. */}
              {!isMemberMode && (
                <button
                  type="button"
                  className="team-add"
                  onClick={() =>
                    setOpenForm(
                      openForm === "deadline"
                        ? ""
                        : "deadline"
                    )
                  }
                >
                  + Add
                </button>
              )}

            </div>

            {!isMemberMode && openForm === "deadline" && (
              <form
                className="team-form"
                onSubmit={addTeamDeadline}
              >

                <input
                  placeholder="Deadline name"
                  value={teamDeadlineForm.title}
                  onChange={(event) =>
                    setTeamDeadlineForm({
                      ...teamDeadlineForm,
                      title: event.target.value,
                    })
                  }
                  required
                />

                <input
                  type="date"
                  aria-label="Deadline date"
                  value={teamDeadlineForm.date}
                  onChange={(event) =>
                    setTeamDeadlineForm({
                      ...teamDeadlineForm,
                      date: event.target.value,
                    })
                  }
                  required
                />

                <button type="submit">
                  Save
                </button>

              </form>
            )}

            <div className="deadline-list">

              {isMemberMode ? (
                memberTasksLoading ? (
                  <p className="team-empty">Loading deadlines...</p>
                ) : memberTasksError ? (
                  <p className="team-empty">Unable to load deadlines right now.</p>
                ) : firebaseDeadlines.length ? (
                  firebaseDeadlines.map((task) => (
                    <div className="deadline" key={task.id}>
                      <div>
                        • &nbsp; {task.title}
                      </div>

                      <span>
                        {formatDueDate(task.dueDate)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="team-empty">
                    No upcoming deadlines.
                  </p>
                )
              ) : teamDeadlines.length ? (
                teamDeadlines.map(
                  (deadline, index) => (
                    <div
                      className="deadline"
                      key={
                        deadline.id || index
                      }
                    >

                      <div>
                        • &nbsp; {deadline.title}
                      </div>

                      <span>
                        {deadline.date}
                      </span>

                      <button
                        type="button"
                        className="team-delete"
                        onClick={() =>
                          deleteItem(
                            "dronaid-team-deadlines",
                            setTeamDeadlines,
                            teamDeadlines,
                            deadline.id
                          )
                        }
                        aria-label={`Delete ${deadline.title}`}
                      >
                        ×
                      </button>

                    </div>
                  )
                )
              ) : (
                <p className="team-empty">
                  No upcoming deadlines.
                </p>
              )}

            </div>

            <button
              type="button"
              className="view-all"
            >
              <span>
                View All
              </span>

              <ArrowIcon />
            </button>

          </div>

        </aside>

        {/* RIGHT DRONE */}

        <div className="right-drone">

          <Drone flip />

        </div>

      </main>

    </div>
  );
}