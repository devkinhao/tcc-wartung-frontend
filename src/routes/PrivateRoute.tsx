import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { paths } from "./paths";

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or spinner
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />;
  }

  return <Outlet />;
}