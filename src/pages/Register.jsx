import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Utilisateur");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    setLoading(true);

    if (!nom.trim() || !prenom.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      await register(email, password, nom, prenom, role);
      addToast("Compte créé avec succès !", "success");
      setMessage("Compte créé ! Vous pouvez maintenant vous connecter.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Une erreur est survenue lors de l'inscription.");
      addToast("Erreur lors de l'inscription", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "460px" }}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div className="logo-badge" style={{ fontSize: "1.2rem", padding: "0.4rem 1rem", marginBottom: "1rem" }}>
            <span className="highlight">ASALLI</span>&nbsp;PILOT
          </div>
          <h2 style={{ fontSize: "1.4rem", color: "var(--text-main)" }}>Créer un compte</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Inscrivez-vous pour rejoindre l'espace QSE
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }} noValidate>
          <div className="grid-2" style={{ gap: "0.85rem" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Prénom</label>
              <input
                type="text"
                placeholder="Jean"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Nom</label>
              <input
                type="text"
                placeholder="Dupont"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Rôle Professionnel</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="input-field"
              style={{ padding: "0 0.75rem" }}
            >
              <option value="Utilisateur">Utilisateur / Opérateur</option>
              <option value="Auditeur">Auditeur Interne</option>
              <option value="Responsable QSE">Responsable QSE</option>
              <option value="Administrateur">Administrateur</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Adresse Email</label>
            <input
              type="email"
              placeholder="jean.dupont@exemple.com"
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
              placeholder="Min. 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {errorMessage && (
            <div style={{
              padding: "10px 14px",
              backgroundColor: "hsl(350, 89%, 95%)",
              color: "hsl(350, 89%, 30%)",
              border: "1px solid hsl(350, 89%, 85%)",
              borderRadius: "var(--radius-xs)",
              fontSize: "0.8rem",
              fontWeight: 600
            }}>
              {errorMessage}
            </div>
          )}

          {message && (
            <div style={{
              padding: "10px 14px",
              backgroundColor: "hsl(142, 70%, 95%)",
              color: "hsl(142, 70%, 25%)",
              border: "1px solid hsl(142, 70%, 85%)",
              borderRadius: "var(--radius-xs)",
              fontSize: "0.8rem",
              fontWeight: 600
            }}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: "100%", height: "48px", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", fontSize: "0.85rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Déjà inscrit ? </span>
          <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "underline" }}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}