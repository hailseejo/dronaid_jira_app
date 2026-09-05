import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppBar from "../components/layout/AppBar";
import Dashboard from "../components/dashboard/Dashboard";
import LegacyDashboard from "../components/dashboard/LegacyDashboard";
import CompetitionPage from "../pages/Competition/CompetitionPage";

import GeneralPage from "../pages/General/GeneralPage";
import LoginPage from "../pages/Login/LoginPage";
import SignUpPage from "../pages/SignUp/SignUpPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/general" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Website opens → Login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* SIGN UP */}
        <Route
          path="/signup"
          element={<SignUpPage />}
        />

        {/* AFTER LOGIN → OUR NEW DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/general"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace-dashboard"
          element={
            <ProtectedRoute>
              <LegacyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <LegacyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/competition"
          element={
            <ProtectedRoute>
              <CompetitionPage />
            </ProtectedRoute>
          }
        />

        {/* Anything else → Login */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
        <Route element={<div className="app-shell"><AppBar /><GeneralPage /></div>} path="/general" />
        <Route element={<div className="app-shell"><AppBar /><GeneralPage initialTab="Competition" /></div>} path="/competition" />
        <Route element={<div className="app-shell"><AppBar /><GeneralPage initialTab="Team" /></div>} path="/team" />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/workspace-dashboard" element={<ProtectedRoute><LegacyDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/general" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
