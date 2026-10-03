import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// Base guard: must be authenticated AND have a Firestore profile.
// Uses the single AuthContext auth listener rather than creating its own
// (the previous version duplicated onAuthStateChanged here).
//
// Pass requireAdmin to also gate on role === "Admin".
export default function ProtectedRoute({ children, requireAdmin = false, requireEb = false, requireFinance = false }) {
  const { currentUser, userProfile, loading, profileMissing, profileError, isAdmin } =
    useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <span>INITIALIZING HUD SECURITY SYSTEM...</span>
      </div>
    );
  }

  if (!currentUser) {
    const returnPath = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(returnPath)}`}
        replace
      />
    );
  }

  if (profileError) {
    return (
      <div className="loading-screen">
        <span>Unable to load your profile. Please refresh or contact an admin.</span>
      </div>
    );
  }

  if (profileMissing) {
    return (
      <div className="loading-screen">
        <span>
          Your account is authenticated, but no profile was found. Contact an
          admin to have your DRONAID profile created.
        </span>
      </div>
    );
  }

  if (requireEb && userProfile?.role !== "EB") {
    return <Navigate to="/access-denied" replace />;
  }

  if (requireFinance && userProfile?.role !== "EB" && userProfile?.financeAccess !== true) {
    return <Navigate to="/access-denied" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
