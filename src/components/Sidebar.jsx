import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  LayoutDashboard, Users, Megaphone, FileText, 
  ClipboardCheck, AlertTriangle, ShieldCheck 
} from "lucide-react";

export default function Sidebar() {
  const { profile } = useAuth();

  if (!profile) return null;

  const role = profile.role;

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Causeries SSE", path: "/causeries", icon: Megaphone },
    { label: "Visites SSE", path: "/visites", icon: ClipboardCheck },
    { label: "REX", path: "/rex", icon: AlertTriangle },
    { label: "Actions", path: "/actions", icon: FileText },
    ...(role === "Administrateur" || role === "Responsable QSE" || role === "Auditeur"
      ? [{ label: "Audits ISO", path: "/audits", icon: ShieldCheck }]
      : []),
    ...(role === "Administrateur"
      ? [{ label: "Utilisateurs", path: "/users", icon: Users }]
      : []),
  ];

  return (
    <aside className="sidebar md-show">
      <div className="sidebar-section">
        <span className="sidebar-title">Menu QSE</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", padding: "0.5rem 0.75rem", borderTop: "1px solid var(--border-color)" }}>
        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, display: "block" }}>
          ASALLI Pilot
        </span>
        <span style={{ fontSize: "0.55rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
          Roue PDCA Deming SSE
        </span>
      </div>
    </aside>
  );
}
