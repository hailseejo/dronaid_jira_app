import React from "react";
import { Outlet } from "react-router-dom";

import AppBar from "./AppBar";
import Sidebar from "./Sidebar";

import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="main-layout">

      {/* Top Navigation Bar */}
      <AppBar />

      {/* Sidebar + Main Content */}
      <div className="layout-body">

        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;