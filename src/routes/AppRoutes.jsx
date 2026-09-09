import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";
import RoleSelectionPage from "../pages/RoleSelection/RoleSelectionPage";
import ExecutiveBoardPage from "../pages/ExecutiveBoard/ExecutiveBoardPage";
import ExecutiveBoardMembersPage from "../pages/ExecutiveBoardMembers/ExecutiveBoardMembersPage";
import ExecutiveBoardMemberSignupPage from "../pages/ExecutiveBoardMemberSignup/ExecutiveBoardMemberSignupPage";
import SignUpPage from "../pages/SignUp/SignUpPage";

import Dashboard from "../components/dashboard/Dashboard";
import LegacyDashboard from "../components/dashboard/LegacyDashboard";
import CompetitionPage from "../pages/Competition/CompetitionPage";
import AnnouncementsPage from "../pages/Announcements/AnnouncementsPage";

import MemberPage from "../pages/Member/MemberPage";
import AccessDenied from "../components/common/AccessDenied";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<RoleSelectionPage />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* EXECUTIVE BOARD PORTAL */}
        <Route
          path="/executive-board"
          element={<ExecutiveBoardPage />}
        />

        {/* EXECUTIVE BOARD MEMBER MANAGEMENT */}
        <Route
          path="/executive-board/members"
          element={
            <ProtectedRoute requireAdmin>
              <ExecutiveBoardMembersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/executive-board/members/create"
          element={
            <ProtectedRoute requireAdmin>
              <ExecutiveBoardMemberSignupPage />
            </ProtectedRoute>
          }
        />

        {/* SIGN UP */}
        <Route
          path="/signup"
          element={<SignUpPage />}
        />

        {/* MAIN DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* EB SUBSYSTEM VIEWS */}
        <Route
          path="/subsystem/:subsystem"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* GENERAL */}
        <Route
          path="/general"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* WORKSPACE DASHBOARD */}
        <Route
          path="/workspace-dashboard"
          element={
            <ProtectedRoute>
              <LegacyDashboard />
            </ProtectedRoute>
          }
        />

        {/* TEAM */}
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <LegacyDashboard />
            </ProtectedRoute>
          }
        />

        {/* COMPETITION */}
        <Route
          path="/competition"
          element={
            <ProtectedRoute>
              <CompetitionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />

        {/* MEMBER PAGE */}
        <Route
          path="/member/:memberId"
          element={
            <ProtectedRoute>
              <MemberPage />
            </ProtectedRoute>
          }
        />

        {/* ACCESS DENIED */}
        <Route
          path="/access-denied"
          element={<AccessDenied />}
        />

        {/* UNKNOWN ROUTE */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}