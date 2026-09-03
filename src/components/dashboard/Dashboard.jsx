import React from "react";
import "./Dashboard.css";


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
// DRONAID LOGO
// =====================================================

function Logo() {
  return (
    <div className="logo">

      <div className="logo-mark">
        <span className="logo-wing left"></span>
        <span className="logo-wing right"></span>
        <span className="logo-cross">+</span>
      </div>

      <span className="logo-name">
        DRONAID
      </span>

    </div>
  );
}


// =====================================================
// DRONE
// =====================================================

function Drone({ flip = false }) {
  return (
    <div
      className={`drone ${flip ? "flip" : ""}`}
    >

      <svg
        viewBox="0 0 320 260"
        className="drone-svg"
      >

        {/* LEFT PROPELLER */}

        <g className="drone-line">

          <ellipse
            cx="65"
            cy="50"
            rx="45"
            ry="7"
          />

          <ellipse
            cx="65"
            cy="50"
            rx="7"
            ry="45"
          />

          <circle
            cx="65"
            cy="50"
            r="9"
          />

        </g>


        {/* RIGHT PROPELLER */}

        <g className="drone-line">

          <ellipse
            cx="255"
            cy="50"
            rx="45"
            ry="7"
          />

          <ellipse
            cx="255"
            cy="50"
            rx="7"
            ry="45"
          />

          <circle
            cx="255"
            cy="50"
            r="9"
          />

        </g>


        {/* ARMS */}

        <g className="drone-line">

          <path d="M65 60v45" />
          <path d="M255 60v45" />

          <path d="M65 98l58 35" />
          <path d="M255 98l-58 35" />

          <path d="M65 98l-35 25" />
          <path d="M255 98l35 25" />

        </g>


        {/* MOTORS */}

        <g className="drone-line">

          <rect
            x="48"
            y="94"
            width="34"
            height="22"
            rx="5"
          />

          <rect
            x="238"
            y="94"
            width="34"
            height="22"
            rx="5"
          />

        </g>


        {/* MAIN BODY */}

        <g className="drone-body">

          <path
            d="
              M105 132
              L126 109
              L194 109
              L215 132
              L201 185
              L119 185
              Z
            "
          />

          <path
            d="
              M126 109
              L136 95
              L184 95
              L194 109
            "
          />

        </g>


        {/* BODY DETAILS */}

        <g className="drone-line">

          <path d="M120 138h80" />
          <path d="M120 150h80" />
          <path d="M120 162h80" />

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
// DATA
// =====================================================

const todoTasks = [
  {
    title: "Design Review",
    date: "Due: 01 Jun 2025",
    priority: "urgent",
  },
  {
    title: "Payload Calibration",
    date: "Due: 15 Jun 2025",
    priority: "high",
  },
  {
    title: "Software Update",
    date: "Due: 12 Jun 2025",
    priority: "medium",
  },
  {
    title: "Test Plan Approval",
    date: "Due: 18 Jun 2025",
    priority: "high",
  },
  {
    title: "Documentation",
    date: "Due: 20 Jun 2025",
    priority: "medium",
  },
];

const progressTasks = [
  "Sensor Integration",
  "Flight Controller Test",
  "Motor Testing",
];

const dependencies = [
  {
    title: "PCB Design (Electronics)",
    member: "By Member 4",
    date: "Due: 08 Jun 2025",
  },
  {
    title: "Frame Manufacturing",
    member: "By Member 5",
    date: "Due: 11 Jun 2025",
  },
];


// =====================================================
// TODO ITEM
// =====================================================

function TodoItem({ task }) {
  return (
    <div className="todo-item">

      <div className="todo-name">
        {task.title}
      </div>

      <div className="todo-date">

        <span
          className={`priority-dot ${task.priority}`}
        ></span>

        {task.date}

      </div>

    </div>
  );
}


// =====================================================
// MAIN DASHBOARD
// =====================================================

export default function Dashboard() {

  return (

    <div className="dashboard">


      {/* BACKGROUND */}

      <div className="grid-background"></div>

      <div className="purple-glow glow-one"></div>

      <div className="purple-glow glow-two"></div>


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">


        {/* LOGO */}

        <Logo />


        {/* NAVIGATION */}

        <nav className="nav">

          <button className="nav-button active">
            GENERAL
          </button>

          <button className="nav-button">
            COMPETITION
          </button>

          <button className="nav-button">
            TEAM
          </button>

        </nav>


        {/* PROFILE */}

        <button className="header-user">

          <span className="user-circle">
            <UserIcon />
          </span>

          <span className="user-arrow">
            ▾
          </span>

        </button>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main">


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
              Hi, Name
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
                  To do (5)
                </span>

              </div>


              <div className="task-list">

                {todoTasks.map(
                  (task, index) => (

                    <TodoItem
                      key={index}
                      task={task}
                    />

                  )
                )}

              </div>


              <button className="view-all">

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
                  In Progress (3)
                </span>

              </div>


              <div className="task-list">

                {progressTasks.map(
                  (task, index) => (

                    <div
                      className="progress-item"
                      key={index}
                    >

                      {task}

                    </div>

                  )
                )}

              </div>


              <button className="view-all">

                <span>
                  View All Tasks
                </span>

                <ArrowIcon />

              </button>


            </div>


            {/* =================================================
                DEPENDENT CARD
            ================================================= */}

            <div className="card">


              <div className="card-heading">

                <span className="card-icon">
                  <TeamIcon />
                </span>

                <span>
                  Dependent (2)
                </span>

              </div>


              <div className="dependency-list">

                {dependencies.map(
                  (dependency, index) => (

                    <div
                      className="dependency-item"
                      key={index}
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

                    </div>

                  )
                )}

              </div>


              <button className="view-all">

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
                <strong>Name</strong>
              </div>

              <div>
                <span>Subsystem:</span>
                <strong>Avionics</strong>
              </div>

              <div>
                <span>Role:</span>
                <strong>Subsystem Lead</strong>
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

            <h2>
              Upcoming Deadlines
            </h2>


            <div className="deadline-list">


              <div className="deadline">

                <div>
                  • &nbsp; Sensor Integration
                </div>

                <span>
                  05 Jun 2025
                </span>

              </div>


              <div className="deadline">

                <div>
                  • &nbsp; Flight Controller Test
                </div>

                <span>
                  10 Jun 2025
                </span>

              </div>


              <div className="deadline">

                <div>
                  • &nbsp; Payload Calibration
                </div>

                <span>
                  15 Jun 2025
                </span>

              </div>


            </div>


            <button className="view-all">

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


        {/* GPS */}

        <div className="gps">

          <div>
            GPS : <span>LOCKED</span>
          </div>

          <div>
            SAT : <span>12</span>
          </div>

          <div>
            MODE : <span>STANDBY</span>
          </div>

        </div>


      </main>

    </div>
  );
}