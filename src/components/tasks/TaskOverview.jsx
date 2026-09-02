import React, { useState } from "react";
import "./TaskOverview.css";

function TaskOverview() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Flight Controller Testing",
      description:
        "Test the flight controller and verify all sensor readings.",
      status: "In Progress",
      priority: "High",
      assignee: "Riddhima",
      dueDate: "Sep 5, 2026",
    },
    {
      id: 2,
      title: "Navigation System Update",
      description:
        "Improve the drone navigation logic and test waypoint accuracy.",
      status: "To Do",
      priority: "Medium",
      assignee: "Team Member",
      dueDate: "Sep 7, 2026",
    },
    {
      id: 3,
      title: "Competition Documentation",
      description:
        "Complete the technical documentation for the upcoming competition.",
      status: "In Review",
      priority: "High",
      assignee: "Team Member",
      dueDate: "Sep 8, 2026",
    },
    {
      id: 4,
      title: "Battery Performance Analysis",
      description:
        "Analyze battery performance from the recent flight tests.",
      status: "Completed",
      priority: "Low",
      assignee: "Team Member",
      dueDate: "Sep 3, 2026",
    },
  ]);

  const [filter, setFilter] = useState("All");

  const filteredTasks =
    filter === "All"
      ? tasks
      : tasks.filter((task) => task.status === filter);

  return (
    <section className="task-overview">

      {/* Header */}
      <div className="task-overview-header">

        <div>
          <h2>Ongoing Tasks</h2>
          <p>Track your team's current tasks and progress</p>
        </div>

        <div className="task-count">
          {tasks.length} Tasks
        </div>

      </div>


      {/* Filter Buttons */}
      <div className="task-filters">

        <button
          className={filter === "All" ? "filter-button active" : "filter-button"}
          onClick={() => setFilter("All")}
        >
          All
        </button>

        <button
          className={
            filter === "To Do"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setFilter("To Do")}
        >
          To Do
        </button>

        <button
          className={
            filter === "In Progress"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setFilter("In Progress")}
        >
          In Progress
        </button>

        <button
          className={
            filter === "In Review"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setFilter("In Review")}
        >
          In Review
        </button>

        <button
          className={
            filter === "Completed"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setFilter("Completed")}
        >
          Completed
        </button>

      </div>


      {/* Task List */}
      <div className="task-list">

        {filteredTasks.length === 0 ? (

          <div className="no-tasks">
            <div className="no-tasks-icon">✓</div>

            <h3>No Tasks Found</h3>

            <p>
              There are no tasks in this category.
            </p>
          </div>

        ) : (

          filteredTasks.map((task) => (

            <div className="task-card" key={task.id}>

              {/* Task Main Content */}
              <div className="task-card-main">

                <div className="task-title-row">

                  <h3>{task.title}</h3>

                  <span
                    className={`task-status ${getStatusClass(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>

                </div>


                <p className="task-description">
                  {task.description}
                </p>


                {/* Task Details */}
                <div className="task-details">

                  <div className="task-detail">
                    <span className="detail-label">
                      Assignee
                    </span>

                    <span className="detail-value">
                      {task.assignee}
                    </span>
                  </div>


                  <div className="task-detail">
                    <span className="detail-label">
                      Due Date
                    </span>

                    <span className="detail-value">
                      {task.dueDate}
                    </span>
                  </div>


                  <div className="task-detail">
                    <span className="detail-label">
                      Priority
                    </span>

                    <span
                      className={`detail-value ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </section>
  );
}


/* =========================================
   STATUS CLASS
   ========================================= */

function getStatusClass(status) {
  switch (status) {
    case "To Do":
      return "status-todo";

    case "In Progress":
      return "status-progress";

    case "In Review":
      return "status-review";

    case "Completed":
      return "status-done";

    default:
      return "";
  }
}


/* =========================================
   PRIORITY CLASS
   ========================================= */

function getPriorityClass(priority) {
  switch (priority) {
    case "High":
      return "priority-high";

    case "Medium":
      return "priority-medium";

    case "Low":
      return "priority-low";

    default:
      return "";
  }
}


export default TaskOverview;