import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUserProfile } from "../services/currentUser";

export default function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function loadRole() {
      const profile = await getCurrentUserProfile();

      if (profile) {
        setRole(profile.role);
      }

      setLoading(false);
    }

    loadRole();
  }, []);

  if (loading) {
    return <p style={{ padding: "30px" }}>Chargement...</p>;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}