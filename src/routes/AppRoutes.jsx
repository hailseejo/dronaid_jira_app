import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";
import SignUpPage from "../pages/SignUp/SignUpPage";

import Dashboard from "../components/dashboard/Dashboard";

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

        {/* Anything else → Login */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}