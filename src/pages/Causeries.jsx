import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import SignaturePad from "../components/SignaturePad";
import PageLayout from "../components/PageLayout";
import { Users, Plus, Trash2, Calendar, MapPin, CheckCircle } from "lucide-react";

export default function Causeries() {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [causeries, setCauseries] = useState([]);

  const [site, setSite] = useState("");
  const [dateCauserie, setDateCauserie] = useState(new Date().toISOString().split("T")[0]);
  const [sujet, setSujet] = useState("");
  const [themes, setThemes] = useState("");
  const [pointsPositifs, setPointsPositifs] = useState("");
  const [pointsAmeliorer, setPointsAmeliorer] = useState("");
  const [signatureAnimateur, setSignatureAnimateur] = useState("");
  const [participants, setParticipants] = useState([{ name: "", signature: "" }]);
  const [loading, setLoading] = useState(false);

  async function loadCauseries() {
    const { data, error } = await supabase
      .from("causeries_sse")
      .select("*")
      .order("date_causerie", { ascending: false });

    if (error) {
      console.error("Erreur chargement causeries :", error);
      addToast("Erreur lors du chargement des causeries", "error");
      return;
    }

    setCauseries(data || []);
  }

  useEffect(() => {
    loadCauseries();
  }, []);

  function handleAddParticipant() {
    setParticipants([...participants, { name: "", signature: "" }]);
  }

  function handleRemoveParticipant(index) {
    setParticipants(participants.filter((_, i) => i !== index));
  }

  function handleParticipantChange(index, field, val) {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: val };
    setParticipants(updated);
  }

  async function ajouterCauserie(event) {
    event.preventDefault();
    setLoading(true);

    if (!site.trim() || !sujet.trim() || !themes.trim()) {
      addToast("Veuillez remplir le site, le sujet et la synthèse.", "error");
      setLoading(false);
      return;
    }

    if (!signatureAnimateur) {
      addToast("La signature de l'animateur est obligatoire.", "error");
      setLoading(false);
      return;
    }

    const filteredParticipants = participants.filter((p) => p.name.trim() !== "");

    const { error } = await supabase.from("causeries_sse").insert([
      {
        site,
        date_causerie: dateCauserie,
        sujet,
        themes,
        points_positifs: pointsPositifs,
        points_ameliorer: pointsAmeliorer,
        signature_animateur: signatureAnimateur,
        participants: filteredParticipants,
        animateur_id: profile?.id || null,
        status: "validated",
      },
    ]);

    if (error) {
      addToast("Erreur lors de l'ajout de la causerie", "error");
      console.error(error);
      setLoading(false);
      return;
    }

    addToast("Causerie SSE enregistrée avec succès !", "success");

    setSite("");
    setDateCauserie(new Date().toISOString().split("T")[0]);
    setSujet("");
    setThemes("");
    setPointsPositifs("");
    setPointsAmeliorer("");
    setSignatureAnimateur("");
    setParticipants([{ name: "", signature: "" }]);

    await loadCauseries();
    setLoading(false);
  }

  async function supprimerCauserie(id) {
    const confirmation = confirm("Supprimer cette causerie ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("causeries_sse")
      .delete()
      .eq("id", id);

    if (error) {
      addToast("Erreur lors de la suppression", "error");
      console.error(error);
      return;
    }

    addToast("Causerie supprimée", "success");
    loadCauseries();
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  return (
    <PageLayout title="Causeries SSE">
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem" }}>
        <div>
          <form className="form-card" onSubmit={ajouterCauserie} noValidate>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              Nouvelle Causerie SSE
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
                    placeholder="Ex: Hangar 4 - Miramas"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Date de la Causerie</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    value={dateCauserie}
                    onChange={(e) => setDateCauserie(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Thème / Sujet de Sécurité</label>
              <input
                type="text"
                placeholder="Ex: Port des EPI de soudage / Risques liés au meulage"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Synthèse des Échanges SSE</label>
              <textarea
                placeholder="Rappels de sécurité effectués, questions posées par l'équipe, etc."
                value={themes}
                onChange={(e) => setThemes(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Points Positifs Constatés</label>
                <textarea
                  placeholder="Ce qui va bien..."
                  value={pointsPositifs}
                  onChange={(e) => setPointsPositifs(e.target.value)}
                  className="input-field"
                  style={{ minHeight: "80px" }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Points à Améliorer / Actions</label>
                <textarea
                  placeholder="Ce qui doit changer..."
                  value={pointsAmeliorer}
                  onChange={(e) => setPointsAmeliorer(e.target.value)}
                  className="input-field"
                  style={{ minHeight: "80px" }}
                />
              </div>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "1.25rem", borderRadius: "var(--radius-sm)", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={16} /> Émargement des participants
                </span>
                <button type="button" onClick={handleAddParticipant} className="btn btn-secondary" style={{ height: "30px", fontSize: "0.75rem", padding: "0 10px", borderRadius: "4px" }}>
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {participants.map((part, index) => (
                  <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={part.name}
                      onChange={(e) => handleParticipantChange(index, "name", e.target.value)}
                      className="input-field"
                      style={{ height: "38px", fontSize: "0.85rem" }}
                    />
                    <SignaturePad
                      label="Émargement"
                      isReadOnly={false}
                      initialData={part.signature}
                      onSave={(sig) => handleParticipantChange(index, "signature", sig)}
                    />
                    {participants.length > 1 && (
                      <button type="button" onClick={() => handleRemoveParticipant(index)} style={{ background: "none", border: "none", color: "var(--color-a-act)", cursor: "pointer" }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem", width: "100%" }}>
              <SignaturePad
                label={`Signature Animateur : ${profile?.prenom || ""} ${profile?.nom || ""}`}
                isReadOnly={false}
                initialData={signatureAnimateur}
                onSave={setSignatureAnimateur}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "48px", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Enregistrement..." : "Soumettre la fiche de Causerie SSE"}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", margin: 0 }}>
              Fiches enregistrées ({causeries.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "80vh", overflowY: "auto", paddingRight: "5px" }}>
              {causeries.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>Aucune fiche enregistrée.</p>
              ) : (
                causeries.map((c) => (
                  <div key={c.id} className="card" style={{ padding: "1.25rem", boxShadow: "var(--shadow-sm)", borderLeft: "5px solid var(--color-d-do)", display: "flex", flexDirection: "column", gap: "0.75rem", transform: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 800 }}>{c.sujet}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <MapPin size={12} /> {c.site} &bull; <Calendar size={12} /> {formatDate(c.date_causerie)}
                        </span>
                      </div>
                      <button onClick={() => supprimerCauserie(c.id)} className="btn btn-secondary" style={{ height: "28px", width: "28px", padding: 0, color: "var(--color-a-act)", borderRadius: "4px" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-main)", background: "var(--bg-input)", padding: "8px", borderRadius: "4px", whiteSpace: "pre-line" }}>
                      <strong>Synthèse : </strong>{c.themes}
                    </p>

                    {c.points_positifs && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <strong>🟢 Points Positifs : </strong>{c.points_positifs}
                      </p>
                    )}

                    {c.points_ameliorer && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <strong>🔴 À Améliorer : </strong>{c.points_ameliorer}
                      </p>
                    )}

                    {c.participants && c.participants.length > 0 && (
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                          Participants ({c.participants.length}) :
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {c.participants.map((p, pIdx) => (
                            <span key={pIdx} className="badge" style={{ background: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.65rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle size={10} style={{ color: "var(--color-d-do)" }} /> {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem", borderTop: "1px dashed var(--border-color)", paddingTop: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block" }}>Animateur</span>
                        {c.signature_animateur ? (
                          <img src={c.signature_animateur} alt="Signature animateur" style={{ height: "40px", objectFit: "contain", background: "white", borderRadius: "4px", padding: "2px", border: "1px solid var(--border-color)" }} />
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}