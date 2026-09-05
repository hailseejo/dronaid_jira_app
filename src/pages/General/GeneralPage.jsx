import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import SubsystemOverview from "../../components/dashboard/SubsystemOverview";
import RightSidebar from "../../components/dashboard/RightSidebar";
import TasksOverview from "../../components/tasks/TasksOverview";
import "./GeneralPage.css";

const INITIAL_TASKS = [
  { id: 1, task: "Design Review", assignedTo: "Member 1", priority: "High", status: "In Progress", due: "01 Jun 2025" },
  { id: 2, task: "Sensor Integration", assignedTo: "Member 2", priority: "Medium", status: "In Progress", due: "05 Jun 2025" },
  { id: 3, task: "Flight Controller Test", assignedTo: "Member 3", priority: "Low", status: "To Do", due: "10 Jun 2025" },
];

export default function GeneralPage({ initialTab = "General" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedMember, setSelectedMember] = useState(null);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const changeStatus = (id, status) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task));
  return <div className="general-page"><aside className="telemetry-panel telemetry-top"><span>ALT : 120M</span><span>SPD : 18.4 M/S</span><span>BAT : 76%</span></aside><div className="drone-decoration" aria-hidden="true" /><aside className="telemetry-panel telemetry-bottom"><span>GPS : LOCKED</span><span>SAT : 12</span><span>MODE : STANDBY</span></aside><main className="general-page-content"><PageHeader activeTab={activeTab} onTabChange={setActiveTab} />{activeTab === "General" ? <><div className="general-page-grid"><SubsystemOverview onMemberSelect={setSelectedMember} /><RightSidebar expanded={announcementOpen} onToggle={() => setAnnouncementOpen((open) => !open)} /></div><TasksOverview tasks={tasks} onStatusChange={changeStatus} /></> : <section className="card tab-placeholder"><h1>{activeTab}</h1><p>{activeTab} workspace selected. Switch back to General to see your live task overview.</p></section>}</main>{selectedMember && <div className="member-dialog" role="dialog" aria-modal="true" aria-label={`${selectedMember} details`}><div className="member-dialog-panel"><button className="dialog-close" type="button" onClick={() => setSelectedMember(null)}>×</button><h2>{selectedMember}</h2><p>Available for subsystem work</p><button className="btn btn-primary" type="button" onClick={() => setSelectedMember(null)}>Close</button></div></div>}</div>;
}
