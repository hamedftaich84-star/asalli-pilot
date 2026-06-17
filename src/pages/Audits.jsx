import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import PageLayout from "../components/PageLayout";
import ErrorMessage from "../components/ErrorMessage";
import { useToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { exportAuditsPdf } from "../services/exportAuditsPdf";
import { Download, Plus, Trash2, Calendar } from "lucide-react";

export default function Audits() {
  const { profile } = useAuth();
  const { addToast } = useToast();

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [norme, setNorme] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [auditeur, setAuditeur] = useState("");
  const [resultat, setResultat] = useState("");
  const [observation, setObservation] = useState("");
  const [dateAudit, setDateAudit] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [messageErreur, setMessageErreur] = useState("");

  useEffect(() => {
    if (profile) {
      setAuditeur(`${profile.prenom} ${profile.nom}`);
    }
  }, [profile]);

  async function chargerAudits() {
    const { data, error } = await supabase
      .from("audits_iso")
      .select("*")
      .order("date_audit", { ascending: false });

    if (error) {
      setMessageErreur("Erreur lors du chargement des audits");
      console.error(error);
      return;
    }

    setAudits(data || []);
  }

  useEffect(() => {
    chargerAudits();
  }, []);

  async function ajouterAudit(event) {
    event.preventDefault();
    setMessageErreur("");

    if (!norme) {
      setMessageErreur("Veuillez sélectionner une norme");
      return;
    }

    if (!chapitre.trim()) {
      setMessageErreur("Veuillez saisir le chapitre audité");
      return;
    }

    if (!auditeur.trim()) {
      setMessageErreur("Veuillez saisir l'auditeur");
      return;
    }

    if (!resultat) {
      setMessageErreur("Veuillez sélectionner le résultat");
      return;
    }

    if (!dateAudit) {
      setMessageErreur("Veuillez entrer la date d'audit");
      return;
    }

    if (!observation.trim()) {
      setMessageErreur("Veuillez saisir l'observation");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("audits_iso").insert([
      {
        norme,
        chapitre,
        auditeur,
        resultat,
        observation,
        date_audit: dateAudit,
      },
    ]);

    if (error) {
      console.error(error);
      setMessageErreur(`Erreur lors de l'ajout de l'audit : ${error.message}`);
      setLoading(false);
      return;
    }

    addToast("Rapport d'audit enregistré !", "success");

    setNorme("");
    setChapitre("");
    setResultat("");
    setObservation("");
    setDateAudit(new Date().toISOString().split("T")[0]);

    await chargerAudits();
    setLoading(false);
  }

  async function supprimerAudit(id) {
    const confirmation = confirm("Supprimer cet audit ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("audits_iso")
      .delete()
      .eq("id", id);

    if (error) {
      setMessageErreur("Erreur lors de la suppression");
      console.error(error);
      return;
    }

    addToast("Audit supprimé", "success");
    chargerAudits();
  }

  function couleurResultat(resultat) {
    if (resultat === "Conforme") return "var(--color-d-do)";
    if (resultat === "Observation") return "var(--color-c-check)";
    return "var(--color-a-act)";
  }

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR");
  }

  function handleExportPdf() {
    if (audits.length === 0) {
      addToast("Aucun audit à exporter.", "info");
      return;
    }

    exportAuditsPdf(audits);
    addToast("Rapport des audits exporté avec succès !", "success");
  }

  return (
    <PageLayout title="Audits ISO & Conformité">
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "2rem",
        }}
      >
        <div>
          <form className="form-card" onSubmit={ajouterAudit} noValidate>
            <h2
              style={{
                fontSize: "1.2rem",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "0.5rem",
              }}
            >
              Enregistrer un rapport d'Audit
            </h2>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Norme de Référence</label>
                <select
                  value={norme}
                  onChange={(e) => setNorme(e.target.value)}
                  className="input-field"
                  style={{ padding: "0 0.75rem" }}
                >
                  <option value="">Choisir une norme</option>
                  <option value="ISO 9001">ISO 9001 (Qualité)</option>
                  <option value="ISO 14001">ISO 14001 (Environnement)</option>
                  <option value="ISO 45001">
                    ISO 45001 (Santé & Sécurité)
                  </option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Date d'Audit</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      display: "flex",
                    }}
                  >
                    <Calendar size={16} />
                  </span>

                  <input
                    type="date"
                    value={dateAudit}
                    onChange={(e) => setDateAudit(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Auditeur</label>
                <input
                  type="text"
                  placeholder="Auditeur"
                  value={auditeur}
                  onChange={(e) => setAuditeur(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Résultat d'évaluation</label>
                <select
                  value={resultat}
                  onChange={(e) => setResultat(e.target.value)}
                  className="input-field"
                  style={{ padding: "0 0.75rem" }}
                >
                  <option value="">Choisir un résultat</option>
                  <option value="Conforme">🟢 Conforme</option>
                  <option value="Observation">
                    🟡 Observation (Piste d'amélioration)
                  </option>
                  <option value="Non-conformité">🔴 Non-conformité</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Chapitre / Clause Audité</label>
              <input
                type="text"
                placeholder="Ex: 8.5.1 Contrôle de la production"
                value={chapitre}
                onChange={(e) => setChapitre(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Observations & Constats d'audit
              </label>
              <textarea
                placeholder="Décrivez les écarts ou observations constatées..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                height: "48px",
                marginTop: "0.5rem",
              }}
              disabled={loading}
            >
              <Plus size={18} />{" "}
              {loading ? "Enregistrement..." : "Ajouter le rapport"}
            </button>
          </form>

          {messageErreur && <ErrorMessage message={messageErreur} />}
        </div>

        <div>
          <div
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "0.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                Historique des Audits ({audits.length})
              </h2>

              <button
                onClick={handleExportPdf}
                className="btn btn-secondary"
                style={{
                  height: "32px",
                  fontSize: "0.75rem",
                  padding: "0 10px",
                  borderRadius: "4px",
                }}
              >
                <Download size={14} /> PDF
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                maxHeight: "80vh",
                overflowY: "auto",
                paddingRight: "5px",
              }}
            >
              {audits.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  Aucun rapport enregistré.
                </p>
              ) : (
                audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      boxShadow: "var(--shadow-sm)",
                      borderLeft: `5px solid ${couleurResultat(
                        audit.resultat
                      )}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      transform: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <span
                          className="badge"
                          style={{
                            background: "var(--bg-input)",
                            color: "var(--text-main)",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                          }}
                        >
                          {audit.norme}
                        </span>

                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "4px",
                          }}
                        >
                          <Calendar size={12} /> {formatDate(audit.date_audit)}{" "}
                          &bull; Clause : {audit.chapitre}
                        </span>
                      </div>

                      <button
                        onClick={() => supprimerAudit(audit.id)}
                        className="btn btn-secondary"
                        style={{
                          height: "28px",
                          width: "28px",
                          padding: 0,
                          color: "var(--color-a-act)",
                          borderRadius: "4px",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-main)",
                        background: "var(--bg-input)",
                        padding: "8px",
                        borderRadius: "4px",
                        whiteSpace: "pre-line",
                      }}
                    >
                      <strong>Constat : </strong>
                      {audit.observation}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px dashed var(--border-color)",
                        paddingTop: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Auditeur : <strong>{audit.auditeur}</strong>
                      </span>

                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            audit.resultat === "Conforme"
                              ? "hsl(142, 70%, 95%)"
                              : audit.resultat === "Observation"
                              ? "hsl(38, 92%, 95%)"
                              : "hsl(350, 89%, 95%)",
                          color: couleurResultat(audit.resultat),
                          fontSize: "0.7rem",
                          fontWeight: 800,
                        }}
                      >
                        {audit.resultat}
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