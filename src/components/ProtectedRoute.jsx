import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <p style={{ padding: "30px", color: "var(--text-muted)" }}>Chargement...</p>;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}