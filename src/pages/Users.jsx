import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import PageLayout from "../components/PageLayout";
import { useToast } from "../components/Toast";
import { Plus, Trash2, Mail, Shield, User } from "lucide-react";

export default function Users() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function chargerUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      addToast("Erreur lors du chargement des utilisateurs", "error");
      console.error(error);
      return;
    }

    setUsers(data || []);
  }

  useEffect(() => {
    chargerUsers();
  }, []);

  async function ajouterUser(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!nom.trim()) {
      setErrorMessage("Veuillez saisir le nom");
      return;
    }

    if (!prenom.trim()) {
      setErrorMessage("Veuillez saisir le prénom");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Veuillez saisir l'email");
      return;
    }

    if (!role) {
      setErrorMessage("Veuillez sélectionner un rôle");
      return;
    }

    setLoading(true);

    // Note: Creating a user in public.users directly might fail if RLS requires admin or doesn't support direct insertions
    // of user profiles without corresponding auth.users entry. However, since the existing code had this feature,
    // we will maintain it. But normally, users register themselves, and the admin updates their roles in the console.
    const { error } = await supabase.from("users").insert([
      {
        id: crypto.randomUUID(), // generate a random ID since we aren't creating it via Supabase Auth here
        nom,
        prenom,
        email,
        role,
      },
    ]);

    if (error) {
      setErrorMessage("Erreur lors de l'ajout de l'utilisateur : " + error.message);
      console.error(error);
      setLoading(false);
      return;
    }

    addToast("Utilisateur enregistré avec succès !", "success");
    setNom("");
    setPrenom("");
    setEmail("");
    setRole("");

    chargerUsers();
    setLoading(false);
  }

  async function supprimerUser(id) {
    const confirmation = confirm("Supprimer cet utilisateur ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      addToast("Erreur lors de la suppression", "error");
      console.error(error);
      return;
    }

    addToast("Utilisateur supprimé", "success");
    chargerUsers();
  }

  function getBadgeColor(role) {
    if (role === "Administrateur") return "var(--color-a-act)";
    if (role === "Responsable QSE") return "var(--color-c-check)";
    if (role === "Auditeur") return "var(--color-primary)";
    return "var(--text-muted)";
  }

  return (
    <PageLayout title="Console Administration - Utilisateurs">
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem" }} className="grid-2">
        
        {/* Ajouter Utilisateur */}
        <div>
          <form className="form-card" onSubmit={ajouterUser} noValidate>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              Enregistrer un Collaborateur
            </h2>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Prénom</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
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

            <div className="input-group">
              <label className="input-label">Adresse Email</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="jean.dupont@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "36px" }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Rôle d'accès</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                  <Shield size={16} />
                </span>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                  style={{ padding: "0 36px" }}
                  required
                >
                  <option value="">Choisir un rôle</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="Responsable QSE">Responsable QSE</option>
                  <option value="Auditeur">Auditeur</option>
                  <option value="Utilisateur">Utilisateur</option>
                </select>
              </div>
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", height: "48px", marginTop: "0.5rem" }}
              disabled={loading}
            >
              <Plus size={18} /> Enregistrer le collaborateur
            </button>
          </form>
        </div>

        {/* Liste des comptes */}
        <div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", margin: 0 }}>
              Comptes Collaborateurs ({users.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "80vh", overflowY: "auto", paddingRight: "5px" }}>
              {users.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>Aucun compte enregistré.</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="card"
                    style={{
                      padding: "1rem 1.25rem",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      transform: "none"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 800 }}>
                          {user.prenom} {user.nom}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <Mail size={12} /> {user.email}
                        </span>
                      </div>
                      <button
                        onClick={() => supprimerUser(user.id)}
                        className="btn btn-secondary"
                        style={{ height: "28px", width: "28px", padding: 0, color: "var(--color-a-act)", borderRadius: "4px" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "2px" }}>
                      <span 
                        className="badge" 
                        style={{
                          backgroundColor: "var(--bg-input)",
                          color: getBadgeColor(user.role),
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: `1px solid ${getBadgeColor(user.role)}`
                        }}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}