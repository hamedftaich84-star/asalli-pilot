import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import SignaturePad from "../components/SignaturePad";
import PageLayout from "../components/PageLayout";
import { Trash2, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";

export default function Visites() {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [visites, setVisites] = useState([]);
  const [expandedVisites, setExpandedVisites] = useState({});
  const [loading, setLoading] = useState(false);

  const VISITE_ATELIER_QUESTIONS = [
    "Protection auditive",
    "Vêtement",
    "Gants adaptés",
    "Chaussures",
    "Lunettes adaptées",
    "Mise en place rideau (état)",
    "Balisage de la zone de travail",
    "État matériel/outillage vérifié",
    "Matériel de levage référencé",
    "Rangement et propreté de la zone",
    "État extincteurs",
    "Connaissance du dernier thème QSE",
  ];

  const [site, setSite] = useState("");
  const [dateVisite, setDateVisite] = useState(new Date().toISOString().split("T")[0]);
  const [personnesObservees, setPersonnesObservees] = useState("");
  const [evaluations, setEvaluations] = useState({});
  const [conclusion, setConclusion] = useState("");
  const [signatureVisiteur, setSignatureVisiteur] = useState("");

  useEffect(() => {
    const initial = {};
    VISITE_ATELIER_QUESTIONS.forEach((q) => {
      initial[q] = { state: "Conforme", comment: "" };
    });
    setEvaluations(initial);
    loadVisites();
  }, []);

  async function loadVisites() {
    const { data, error } = await supabase
      .from("visites_sse")
      .select("*")
      .order("date_visite", { ascending: false });

    if (error) {
      console.error("Erreur chargement visites :", error);
      addToast("Erreur lors du chargement des visites", "error");
      return;
    }

    setVisites(data || []);
  }

  function handleChecklistChange(q, field, val) {
    setEvaluations((prev) => ({
      ...prev,
      [q]: {
        ...prev[q],
        [field]: val,
      },
    }));
  }

  async function ajouterVisite(event) {
    event.preventDefault();
    setLoading(true);

    if (!site.trim() || !personnesObservees.trim() || !conclusion.trim()) {
      addToast("Veuillez remplir le site, les personnes observées et la conclusion.", "error");
      setLoading(false);
      return;
    }

    if (!signatureVisiteur) {
      addToast("La signature du visiteur est obligatoire.", "error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("visites_sse").insert([
      {
        site,
        date_visite: dateVisite,
        personnes_observees: personnesObservees,
        evaluations,
        conclusion,
        signature_visiteur: signatureVisiteur,
        visiteur_id: profile?.id || null,
        status: "validated",
      },
    ]);

    if (error) {
      addToast("Erreur lors de l'ajout de la visite", "error");
      console.error(error);
      setLoading(false);
      return;
    }

    addToast("Visite SSE enregistrée avec succès !", "success");

    setSite("");
    setDateVisite(new Date().toISOString().split("T")[0]);
    setPersonnesObservees("");
    setConclusion("");
    setSignatureVisiteur("");

    const initial = {};
    VISITE_ATELIER_QUESTIONS.forEach((q) => {
      initial[q] = { state: "Conforme", comment: "" };
    });
    setEvaluations(initial);

    await loadVisites();
    setLoading(false);
  }

  async function supprimerVisite(id) {
    const confirmation = confirm("Supprimer cette visite ?");
    if (!confirmation) return;

    const { error } = await supabase.from("visites_sse").delete().eq("id", id);

    if (error) {
      addToast("Erreur lors de la suppression", "error");
      console.error(error);
      return;
    }

    addToast("Visite supprimée", "success");
    loadVisites();
  }

  function toggleExpand(id) {
    setExpandedVisites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function getConformitySummary(evals) {
    if (!evals) return { conformes: 0, total: 0 };

    const values = Object.values(evals);
    const conformes = values.filter(
      (v) => v.state === "Conforme" || v.state === "Satisfaisant"
    ).length;

    return { conformes, total: values.length };
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  return (
    <PageLayout title="Visites SSE Atelier">
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem" }} className="grid-2">
        <div>
          <form className="form-card" onSubmit={ajouterVisite} noValidate>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              Nouvelle Visite de Sécurité
            </h2>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Chantier / Site d'intervention</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                    <MapPin size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Ex: Atelier Chaudronnerie"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Date de la Visite</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    value={dateVisite}
                    onChange={(e) => setDateVisite(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Personnes observées / Postes de travail</label>
              <input
                type="text"
                placeholder="Ex: Jean Martin, poste meulage"
                value={personnesObservees}
                onChange={(e) => setPersonnesObservees(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "0.5rem" }}>
              <label className="input-label">Grille d'évaluation sécurité</label>
              <div style={{ overflowX: "auto", width: "100%", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xs)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "10px", fontWeight: 800 }}>Point de contrôle</th>
                      <th style={{ padding: "10px", width: "140px", fontWeight: 800 }}>Évaluation</th>
                      <th style={{ padding: "10px", fontWeight: 800 }}>Observations / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VISITE_ATELIER_QUESTIONS.map((q) => {
                      const rating = evaluations[q] || { state: "Conforme", comment: "" };

                      return (
                        <tr key={q} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600 }}>{q}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <select
                              value={rating.state}
                              onChange={(e) => handleChecklistChange(q, "state", e.target.value)}
                              className="input-field"
                              style={{ height: "32px", fontSize: "0.8rem", padding: "0 4px", borderRadius: "4px" }}
                            >
                              <option value="Conforme">🟢 Conforme</option>
                              <option value="Moyen">🟡 Moyen</option>
                              <option value="À Améliorer">🔴 À Améliorer</option>
                            </select>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <input
                              type="text"
                              placeholder="Remarque"
                              value={rating.comment}
                              onChange={(e) => handleChecklistChange(q, "comment", e.target.value)}
                              className="input-field"
                              style={{ height: "32px", fontSize: "0.8rem", borderRadius: "4px" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: "1rem" }}>
              <label className="input-label">Conclusion & Écarts constatés</label>
              <textarea
                placeholder="Consigner la conclusion de la visite."
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem", width: "100%" }}>
              <SignaturePad
                label={`Signature Visiteur : ${profile?.prenom || ""} ${profile?.nom || ""}`}
                isReadOnly={false}
                initialData={signatureVisiteur}
                onSave={setSignatureVisiteur}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "48px", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Enregistrement..." : "Soumettre la Visite SSE"}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", margin: 0 }}>
              Visites enregistrées ({visites.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "80vh", overflowY: "auto", paddingRight: "5px" }}>
              {visites.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Aucune visite enregistrée.
                </p>
              ) : (
                visites.map((v) => {
                  const { conformes, total } = getConformitySummary(v.evaluations);
                  const isExpanded = expandedVisites[v.id];

                  return (
                    <div key={v.id} className="card" style={{ padding: "1.25rem", boxShadow: "var(--shadow-sm)", borderLeft: "5px solid var(--color-c-check)", display: "flex", flexDirection: "column", gap: "0.75rem", transform: "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 800 }}>{v.site}</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <Calendar size={12} /> {formatDate(v.date_visite)} &bull; Poste : {v.personnes_observees}
                          </span>
                        </div>
                        <button onClick={() => supprimerVisite(v.id)} className="btn btn-secondary" style={{ height: "28px", width: "28px", padding: 0, color: "var(--color-a-act)", borderRadius: "4px" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="badge badge-submitted" style={{ textTransform: "none", fontSize: "0.75rem" }}>
                          Conformité : {conformes} / {total}
                        </span>

                        <button onClick={() => toggleExpand(v.id)} className="btn btn-secondary" style={{ height: "28px", fontSize: "0.75rem", padding: "0 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          {isExpanded ? (
                            <>Masquer la grille <ChevronUp size={14} /></>
                          ) : (
                            <>Voir la grille <ChevronDown size={14} /></>
                          )}
                        </button>
                      </div>

                      {isExpanded && v.evaluations && (
                        <div style={{ border: "1px solid var(--border-color)", borderRadius: "4px", marginTop: "0.5rem", background: "var(--bg-input)", padding: "8px", fontSize: "0.75rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", marginBottom: "4px" }}>
                            <span>Point</span>
                            <span>Statut</span>
                            <span>Observation</span>
                          </div>
                          {Object.entries(v.evaluations).map(([point, data]) => (
                            <div key={point} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", padding: "3px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                              <span style={{ fontWeight: 600 }}>{point}</span>
                              <span style={{ color: data.state === "Conforme" || data.state === "Satisfaisant" ? "var(--color-d-do)" : data.state === "Moyen" ? "var(--color-c-check)" : "var(--color-a-act)" }}>
                                {data.state}
                              </span>
                              <span style={{ fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {data.comment || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p style={{ fontSize: "0.8rem", color: "var(--text-main)", background: "var(--bg-input)", padding: "8px", borderRadius: "4px", whiteSpace: "pre-line" }}>
                        <strong>Conclusion : </strong>{v.conclusion}
                      </p>

                      <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem", borderTop: "1px dashed var(--border-color)", paddingTop: "0.5rem" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block" }}>Visiteur</span>
                          {v.signature_visiteur ? (
                            <img src={v.signature_visiteur} alt="Signature visiteur" style={{ height: "40px", objectFit: "contain", background: "white", borderRadius: "4px", padding: "2px", border: "1px solid var(--border-color)" }} />
                          ) : (
                            <span style={{ fontSize: "0.65rem", fontStyle: "italic" }}>Non signée</span>
                          )}
                        </div>
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block" }}>Créé par</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                            {profile ? `${profile.prenom} ${profile.nom}` : "Utilisateur connecté"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}