import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { 
  Menu, X, Sun, Moon, LogOut, LayoutDashboard, 
  Users, Megaphone, FileText, ClipboardCheck, AlertTriangle, ShieldCheck 
} from "lucide-react";

export default function Navbar() {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!profile) return null;

  const role = profile.role;
  const isDarkMode = theme === "dark";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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
    <>
      <header className="nav-header">
        <div className="container nav-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn btn-secondary md-hide"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <Menu size={24} />
            </button>

            <div 
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }} 
              onClick={() => navigate("/")}
            >
              <div className="logo-badge" style={{ fontSize: "0.9rem", padding: "0.25rem 0.75rem", display: "inline-flex", alignItems: "center" }}>
                <span className="highlight">ASALLI</span>&nbsp;PILOT
              </div>
            </div>
          </div>

          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{
                width: "40px",
                height: "40px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer"
              }}
              title="Changer de mode"
            >
              {isDarkMode ? (
                <Sun size={20} style={{ color: "var(--color-c-check)" }} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* User Info (Desktop only) */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="md-show">
              <div style={{ textAlign: "right", borderRight: "1px solid var(--border-color)", paddingRight: "12px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800 }}>
                  {profile.prenom} {profile.nom}
                </div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {profile.role}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-a-act)",
                  cursor: "pointer"
                }}
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile quick logout */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary md-hide"
              style={{
                width: "40px",
                height: "40px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-a-act)",
              }}
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              width: "280px",
              backgroundColor: "var(--bg-card)",
              boxShadow: "var(--shadow-lg)",
              padding: "1.5rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              zIndex: 101,
              borderRight: "1px solid var(--border-color)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
              <div className="logo-badge" style={{ fontSize: "0.8rem", padding: "0.2rem 0.6rem" }}>
                <span className="highlight">ASALLI</span>&nbsp;QSE
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* User profile card in mobile drawer */}
            <div style={{
              padding: "1rem",
              backgroundColor: "var(--bg-input)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary)",
                color: "var(--text-on-primary)",
                fontWeight: 900,
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {profile.prenom[0]?.toUpperCase()}{profile.nom[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 800 }}>
                  {profile.prenom} {profile.nom}
                </div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {profile.role}
                </div>
              </div>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}