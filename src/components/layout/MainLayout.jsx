import { Outlet } from "react-router-dom";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout-body">
        <AppBar />
        <main className="main-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}