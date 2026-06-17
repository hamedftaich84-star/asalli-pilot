import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import SignaturePad from "../components/SignaturePad";
import PageLayout from "../components/PageLayout";
import { Trash2, Calendar, MapPin, ShieldAlert } from "lucide-react";

export default function Rex() {
  const { profile } = useAuth();
  const { addToast } = useToast();

  const [rexList, setRexList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [site, setSite] = useState("");
  const [dateRex, setDateRex] = useState(new Date().toISOString().split("T")[0]);
  const [heure, setHeure] = useState("08:00");
  const [typeRex, setTypeRex] = useState("");
  const [description, setDescription] = useState("");
  const [causes, setCauses] = useState("");
  const [actionsImmediates, setActionsImmediates] = useState("");
  const [dommages, setDommages] = useState("");
  const [signatureRedacteur, setSignatureRedacteur] = useState("");

  async function loadRex() {
    const { data, error } = await supabase
      .from("rex")
      .select("*")
      .order("date_rex", { ascending: false });

    if (error) {
      console.error("Erreur chargement REX :", error);
      addToast("Erreur lors du chargement des REX", "error");
      return;
    }

    setRexList(data || []);
  }

  useEffect(() => {
    loadRex();
  }, []);

  async function ajouterRex(event) {
    event.preventDefault();
    setLoading(true);

    if (!site.trim() || !typeRex || !description.trim() || !actionsImmediates.trim()) {
      addToast("Veuillez remplir le site, le type, la description et les actions immédiates.", "error");
      setLoading(false);
      return;
    }

    if (!signatureRedacteur) {
      addToast("La signature du déclarant est obligatoire.", "error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("rex").insert([
      {
        site,
        date_rex: dateRex,
        heure,
        type_rex: typeRex,
        description,
        causes,
        actions_immediates: actionsImmediates,
        dommages,
        signature_redacteur: signatureRedacteur,
        redacteur_id: profile?.id || null,
        status: "submitted",
      },
    ]);

    if (error) {
      addToast("Erreur lors de l'ajout du REX", "error");
      console.error(error);
      setLoading(false);
      return;
    }

    addToast("REX enregistré avec succès !", "success");

    setSite("");
    setDateRex(new Date().toISOString().split("T")[0]);
    setHeure("08:00");
    setTypeRex("");
    setDescription("");
    setCauses("");
    setActionsImmediates("");
    setDommages("");
    setSignatureRedacteur("");

    await loadRex();
    setLoading(false);
  }

  async function supprimerRex(id) {
    const confirmation = confirm("Supprimer ce REX ?");
    if (!confirmation) return;

    const { error } = await supabase.from("rex").delete().eq("id", id);

    if (error) {
      addToast("Erreur lors de la suppression", "error");
      console.error(error);
      return;
    }

    addToast("REX supprimé", "success");
    loadRex();
  }

  async function creerActionCorrective(item) {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    const echeance = date.toISOString().split("T")[0];

    const titreAction =
      item.description && item.description.length > 80
        ? `Action REX - ${item.description.substring(0, 80)}...`
        : `Action REX - ${item.description}`;

    const { error } = await supabase.from("actions_correctives").insert([
      {
        titre: titreAction,
        responsable: "",
        statut: "ouverte",
        echeance,
      },
    ]);

    if (error) {
      addToast("Erreur lors du transfert en action corrective", "error");
      console.error(error);
      return;
    }

    addToast("Action corrective créée dans le module Actions !", "success");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  return (
    <PageLayout title="REX (Retour d'Expérience) & Presqu'Accidents">
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem" }} className="grid-2">
        <div>
          <form className="form-card" onSubmit={ajouterRex} noValidate>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              Nouveau Signalement SSE
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
                    placeholder="Ex: Hangar Principal - Zone Débit"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: "0.5rem", marginBottom: 0 }}>
                <div className="input-group">
                  <label className="input-label">Date du Fait</label>
                  <input
                    type="date"
                    value={dateRex}
                    onChange={(e) => setDateRex(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Heure du Fait</label>
                  <input
                    type="time"
                    value={heure}
                    onChange={(e) => setHeure(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Nature du Signalement</label>
                <select
                  value={typeRex}
                  onChange={(e) => setTypeRex(e.target.value)}
                  className="input-field"
                  style={{ padding: "0 0.75rem" }}
                >
                  <option value="">Sélectionner la nature</option>
                  <option value="Accident">🚨 Accident</option>
                  <option value="Presqu'accident">⚠️ Presqu'accident</option>
                  <option value="Situation dangereuse">🔍 Situation dangereuse</option>
                  <option value="Bonne pratique">⭐ Bonne pratique</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Nature des Dommages</label>
                <input
                  type="text"
                  placeholder="Ex: Aucun dommage, tôle pliée, éraflure"
                  value={dommages}
                  onChange={(e) => setDommages(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Description détaillée des Faits</label>
              <textarea
                placeholder="Décrivez précisément les circonstances de l'événement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Causes Probables Identifiées</label>
                <textarea
                  placeholder="Pourquoi cela est-il arrivé selon vous ?"
                  value={causes}
                  onChange={(e) => setCauses(e.target.value)}
                  className="input-field"
                  style={{ minHeight: "80px" }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Actions Immédiates Prises</label>
                <textarea
                  placeholder="Balisage de la zone, arrêt machine, sécurisation..."
                  value={actionsImmediates}
                  onChange={(e) => setActionsImmediates(e.target.value)}
                  className="input-field"
                  style={{ minHeight: "80px" }}
                />
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem", width: "100%" }}>
              <SignaturePad
                label={`Signature Déclarant : ${profile?.prenom || ""} ${profile?.nom || ""}`}
                isReadOnly={false}
                initialData={signatureRedacteur}
                onSave={setSignatureRedacteur}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "48px", marginTop: "1rem" }} disabled={loading}>
              {loading ? "Enregistrement..." : "Soumettre le REX / Presqu'accident"}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", margin: 0 }}>
              REX enregistrés ({rexList.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "80vh", overflowY: "auto", paddingRight: "5px" }}>
              {rexList.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>Aucun REX enregistré.</p>
              ) : (
                rexList.map((item) => (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      boxShadow: "var(--shadow-sm)",
                      borderLeft: `5px solid ${
                        item.type_rex === "Accident"
                          ? "var(--color-a-act)"
                          : item.type_rex === "Presqu'accident"
                          ? "var(--color-c-check)"
                          : "var(--color-primary)"
                      }`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      transform: "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-main)", fontSize: "0.7rem", fontWeight: 800 }}>
                          {item.type_rex}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                          <MapPin size={12} /> {item.site} &bull; <Calendar size={12} /> {formatDate(item.date_rex)} à {item.heure?.substring(0, 5)}
                        </span>
                      </div>

                      <button onClick={() => supprimerRex(item.id)} className="btn btn-secondary" style={{ height: "28px", width: "28px", padding: 0, color: "var(--color-a-act)", borderRadius: "4px" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-main)", background: "var(--bg-input)", padding: "8px", borderRadius: "4px", whiteSpace: "pre-line" }}>
                      <strong>Description : </strong>{item.description}
                    </p>

                    {item.causes && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <strong>Causes : </strong>{item.causes}
                      </p>
                    )}

                    {item.actions_immediates && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <strong>Actions Immédiates : </strong>{item.actions_immediates}
                      </p>
                    )}

                    {item.dommages && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <strong>Dommages : </strong>{item.dommages}
                      </p>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", borderTop: "1px dashed var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block" }}>Déclarant</span>
                        {item.signature_redacteur ? (
                          <img src={item.signature_redacteur} alt="Signature déclarant" style={{ height: "36px", objectFit: "contain", background: "white", borderRadius: "4px", padding: "2px", border: "1px solid var(--border-color)" }} />
                        ) : (
                          <span style={{ fontSize: "0.65rem", fontStyle: "italic" }}>Non signée</span>
                        )}
                      </div>

                      <button onClick={() => creerActionCorrective(item)} className="btn btn-primary" style={{ height: "32px", fontSize: "0.75rem", padding: "0 10px", borderRadius: "4px", background: "var(--color-primary)" }}>
                        <ShieldAlert size={14} /> Créer action corrective
                      </button>
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