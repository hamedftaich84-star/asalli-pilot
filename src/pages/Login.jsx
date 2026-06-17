import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      addToast("Connexion réussie !", "success");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Erreur de connexion. Vérifiez vos identifiants.");
      addToast("Erreur lors de la connexion", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div className="logo-badge" style={{ fontSize: "1.2rem", padding: "0.4rem 1rem", marginBottom: "1rem" }}>
            <span className="highlight">ASALLI</span>&nbsp;PILOT
          </div>
          <h2 style={{ fontSize: "1.4rem", color: "var(--text-main)" }}>Gestion de la Sécurité (SSE)</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Connectez-vous pour piloter vos fiches QSE
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} noValidate>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Adresse Email</label>
            <input
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {errorMessage && (
            <div style={{
              padding: "10px 14px",
              backgroundColor: "var(--toast-error)",
              background: "hsl(350, 89%, 95%)",
              color: "hsl(350, 89%, 30%)",
              border: "1px solid hsl(350, 89%, 85%)",
              borderRadius: "var(--radius-xs)",
              fontSize: "0.8rem",
              fontWeight: 600
            }}>
              {errorMessage}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: "100%", height: "48px", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", fontSize: "0.85rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Nouveau sur la plateforme ? </span>
          <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "underline" }}>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}