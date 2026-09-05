import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";
import SignUpPage from "../pages/SignUp/SignUpPage";

import Dashboard from "../components/dashboard/Dashboard";
import LegacyDashboard from "../components/dashboard/LegacyDashboard";
import CompetitionPage from "../pages/Competition/CompetitionPage";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

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

      </Routes>
    </BrowserRouter>
  );
}
