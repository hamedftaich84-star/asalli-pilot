import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { getCurrentUserProfile } from "../services/currentUser";

export default function Navbar() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await getCurrentUserProfile();
      setProfile(data);
    }

    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const role = profile?.role;

  return (
    <nav
      style={{
        padding: "15px",
        background: "#1f2937",
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Link style={{ color: "white" }} to="/">Dashboard</Link>
      <Link style={{ color: "white" }} to="/causeries">Causeries</Link>
      <Link style={{ color: "white" }} to="/visites">Visites</Link>
      <Link style={{ color: "white" }} to="/rex">REX</Link>
      <Link style={{ color: "white" }} to="/actions">Actions</Link>

      {(role === "Administrateur" ||
        role === "Responsable QSE" ||
        role === "Auditeur") && (
        <Link style={{ color: "white" }} to="/audits">
          Audits
        </Link>
      )}

      {role === "Administrateur" && (
        <Link style={{ color: "white" }} to="/users">
          Utilisateurs
        </Link>
      )}

      <span
        style={{
          color: "white",
          marginLeft: "auto",
          fontWeight: "bold",
        }}
      >
        {profile ? `${profile.prenom} ${profile.nom} — ${profile.role}` : ""}
      </span>

      <button
        onClick={handleLogout}
        style={{
          background: "#dc2626",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Déconnexion
      </button>
    </nav>
  );
}