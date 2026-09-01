import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // TODO: replace with your real auth check (context, redux, etc.)
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;