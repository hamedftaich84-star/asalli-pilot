import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import PageLayout from "../components/PageLayout";
import ErrorMessage from "../components/ErrorMessage";
import { useToast } from "../components/Toast";
import { exportActionsPdf } from "../services/exportActionsPdf";
import { Download, Plus, Trash2, Edit, Save, X, Calendar, User, CheckCircle } from "lucide-react";

export default function Actions() {
  const { addToast } = useToast();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [titre, setTitre] = useState("");
  const [responsable, setResponsable] = useState("");
  const [statut, setStatut] = useState("");
  const [echeance, setEcheance] = useState("");
  const [messageErreur, setMessageErreur] = useState("");

  // Edit states
  const [actionEnModification, setActionEnModification] = useState(null);
  const [titreModif, setTitreModif] = useState("");
  const [responsableModif, setResponsableModif] = useState("");
  const [statutModif, setStatutModif] = useState("");
  const [echeanceModif, setEcheanceModif] = useState("");

  async function chargerActions() {
    const { data, error } = await supabase
      .from("actions_correctives")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessageErreur("Erreur lors du chargement des actions");
      console.error(error);
      return;
    }

    setActions(data || []);
  }

  useEffect(() => {
    chargerActions();
  }, []);

  async function ajouterAction(event) {
    event.preventDefault();
    setMessageErreur("");

    if (!titre.trim()) {
      setMessageErreur("Veuillez saisir le titre de l'action");
      return;
    }

    if (!responsable.trim()) {
      setMessageErreur("Veuillez saisir le responsable");
      return;
    }

    if (!statut) {
      setMessageErreur("Veuillez sélectionner un statut");
      return;
    }

    if (!echeance) {
      setMessageErreur("Veuillez entrer la date d'échéance");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("actions_correctives").insert([
      {
        titre,
        responsable, // compatible with the existing DB column name
        statut,
        echeance,
      },
    ]);

    if (error) {
      setMessageErreur("Erreur lors de l'ajout de l'action");
      console.error(error);
      setLoading(false);
      return;
    }

    addToast("Action corrective créée avec succès !", "success");
    setTitre("");
    setResponsable("");
    setStatut("");
    setEcheance("");

    chargerActions();
    setLoading(false);
  }

  async function supprimerAction(id) {
    const confirmation = confirm("Supprimer cette action ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("actions_correctives")
      .delete()
      .eq("id", id);

    if (error) {
      setMessageErreur("Erreur lors de la suppression");
      console.error(error);
      return;
    }

    addToast("Action supprimée", "success");
    chargerActions();
  }

  function ouvrirModification(action) {
    setActionEnModification(action.id);
    setTitreModif(action.titre || "");
    setResponsableModif(action.responsable || "");
    setStatutModif(action.statut || "");
    setEcheanceModif(action.echeance || "");
    setMessageErreur("");
  }

  function annulerModification() {
    setActionEnModification(null);
    setTitreModif("");
    setResponsableModif("");
    setStatutModif("");
    setEcheanceModif("");
  }

  async function enregistrerModification(id) {
    setMessageErreur("");

    if (!titreModif.trim()) {
      setMessageErreur("Veuillez saisir le titre de l'action");
      return;
    }

    if (!responsableModif.trim()) {
      setMessageErreur("Veuillez saisir le responsable");
      return;
    }

    if (!statutModif) {
      setMessageErreur("Veuillez sélectionner un statut");
      return;
    }

    if (!echeanceModif) {
      setMessageErreur("Veuillez entrer la date d'échéance");
      return;
    }

    const { error } = await supabase
      .from("actions_correctives")
      .update({
        titre: titreModif,
        responsable: responsableModif,
        statut: statutModif,
        echeance: echeanceModif,
      })
      .eq("id", id);

    if (error) {
      setMessageErreur("Erreur lors de la modification");
      console.error(error);
      return;
    }

    addToast("Action mise à jour !", "success");
    annulerModification();
    chargerActions();
  }

  function couleurStatut(statut) {
    if (statut === "cloturee") return "var(--color-d-do)";
    if (statut === "en cours") return "var(--color-c-check)";
    return "var(--color-a-act)";
  }

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR");
  }

  const handleExportPdf = () => {
    if (actions.length === 0) {
      addToast("Aucune action à exporter.", "info");
      return;
    }
    exportActionsPdf(actions);
    addToast("Plan d'actions exporté en PDF avec succès !", "success");
  };

  return (
    <PageLayout title="Actions Correctives">
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem" }} className="grid-2">
        
        {/* Création Action */}
        <div>
          <form className="form-card" onSubmit={ajouterAction} noValidate>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              Enregistrer une Action Corrective
            </h2>

            <div className="input-group">
              <label className="input-label">Titre de l'Action</label>
              <input
                type="text"
                placeholder="Ex: Remplacer le câble d'alimentation du poste de soudure"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Responsable désigné</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Ex: Robert Martin"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Date d'Échéance</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    value={echeance}
                    onChange={(e) => setEcheance(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Statut Initial</label>
              <select 
                value={statut} 
                onChange={(e) => setStatut(e.target.value)} 
                className="input-field"
                style={{ padding: "0 0.75rem" }}
                required
              >
                <option value="">Choisir un statut</option>
                <option value="ouverte">🔴 Ouverte (Non débutée)</option>
                <option value="en cours">🟡 En cours</option>
                <option value="cloturee">🟢 Clôturée</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", height: "48px", marginTop: "0.5rem" }}
              disabled={loading}
            >
              <Plus size={18} /> Ajouter l'action
            </button>
          </form>

          {messageErreur && <ErrorMessage message={messageErreur} />}
        </div>

        {/* Liste des actions */}
        <div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                Plan d'Actions ({actions.length})
              </h2>
              <button
                onClick={handleExportPdf}
                className="btn btn-secondary"
                style={{ height: "32px", fontSize: "0.75rem", padding: "0 10px", borderRadius: "4px" }}
              >
                <Download size={14} /> PDF
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "80vh", overflowY: "auto", paddingRight: "5px" }}>
              {actions.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>Aucune action dans le plan.</p>
              ) : (
                actions.map((action) => (
                  <div
                    key={action.id}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      boxShadow: "var(--shadow-sm)",
                      borderLeft: `5px solid ${couleurStatut(action.statut)}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      transform: "none",
                    }}
                  >
                    {actionEnModification === action.id ? (
                      /* Mode Edition */
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label" style={{ fontSize: "0.65rem" }}>Titre de l'action</label>
                          <input
                            type="text"
                            value={titreModif}
                            onChange={(e) => setTitreModif(e.target.value)}
                            className="input-field"
                            style={{ height: "38px", fontSize: "0.85rem" }}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label" style={{ fontSize: "0.65rem" }}>Responsable</label>
                            <input
                              type="text"
                              value={responsableModif}
                              onChange={(e) => setResponsableModif(e.target.value)}
                              className="input-field"
                              style={{ height: "38px", fontSize: "0.85rem" }}
                            />
                          </div>

                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label" style={{ fontSize: "0.65rem" }}>Échéance</label>
                            <input
                              type="date"
                              value={echeanceModif}
                              onChange={(e) => setEcheanceModif(e.target.value)}
                              className="input-field"
                              style={{ height: "38px", fontSize: "0.85rem" }}
                            />
                          </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label" style={{ fontSize: "0.65rem" }}>Statut</label>
                          <select
                            value={statutModif}
                            onChange={(e) => setStatutModif(e.target.value)}
                            className="input-field"
                            style={{ height: "38px", fontSize: "0.85rem", padding: "0 4px" }}
                          >
                            <option value="ouverte">Ouverte</option>
                            <option value="en cours">En cours</option>
                            <option value="cloturee">Clôturée</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <button
                            onClick={() => enregistrerModification(action.id)}
                            className="btn btn-primary"
                            style={{ height: "32px", fontSize: "0.75rem", flex: 1, borderRadius: "4px" }}
                          >
                            <Save size={14} /> Enregistrer
                          </button>
                          <button
                            onClick={annulerModification}
                            className="btn btn-secondary"
                            style={{ height: "32px", fontSize: "0.75rem", flex: 1, borderRadius: "4px" }}
                          >
                            <X size={14} /> Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Mode Visualisation */
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h4 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 800 }}>{action.titre}</h4>
                          <button
                            onClick={() => supprimerAction(action.id)}
                            className="btn btn-secondary"
                            style={{ height: "28px", width: "28px", padding: 0, color: "var(--color-a-act)", borderRadius: "4px" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          <strong>Responsable :</strong> {action.responsable}
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                          <span 
                            className="badge" 
                            style={{
                              backgroundColor: action.statut === "cloturee" ? "hsl(142, 70%, 95%)" : action.statut === "en cours" ? "hsl(38, 92%, 95%)" : "hsl(350, 89%, 95%)",
                              color: couleurStatut(action.statut),
                              fontSize: "0.7rem",
                              fontWeight: 800
                            }}
                          >
                            {action.statut}
                          </span>

                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Échéance : <strong>{formatDate(action.echeance)}</strong>
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "8px", borderTop: "1px dashed var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                          <button
                            onClick={() => ouvrirModification(action)}
                            className="btn btn-secondary"
                            style={{ height: "30px", fontSize: "0.75rem", padding: "0 8px", borderRadius: "4px", flex: 1, display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Edit size={12} /> Modifier
                          </button>
                        </div>
                      </>
                    )}
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