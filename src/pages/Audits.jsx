import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Audits() {
  const [audits, setAudits] = useState([]);

  const [norme, setNorme] = useState("");
  const [chapitre, setChapitre] = useState("");
  const [auditeur, setAuditeur] = useState("");
  const [resultat, setResultat] = useState("");
  const [observation, setObservation] = useState("");
  const [dateAudit, setDateAudit] = useState("");
  const [messageErreur, setMessageErreur] = useState("");

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

    if (!observation.trim()) {
      setMessageErreur("Veuillez saisir l'observation");
      return;
    }

    if (!dateAudit) {
      setMessageErreur("Veuillez entrer la date d'audit");
      return;
    }

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
      setMessageErreur("Erreur lors de l'ajout de l'audit");
      console.error(error);
      return;
    }

    setNorme("");
    setChapitre("");
    setAuditeur("");
    setResultat("");
    setObservation("");
    setDateAudit("");
    setMessageErreur("");

    chargerAudits();
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

    chargerAudits();
  }

  function couleurResultat(resultat) {
    if (resultat === "Conforme") return "green";
    if (resultat === "Observation") return "orange";
    if (resultat === "Non-conformité") return "red";
    return "#111827";
  }

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR");
  }

  return (
    <div className="page-container">
      <h1>Audits ISO</h1>

      <form className="form-card" onSubmit={ajouterAudit} noValidate>
        <select
          value={norme}
          onChange={(e) => setNorme(e.target.value)}
        >
          <option value="">Choisir une norme</option>
          <option value="ISO 9001">ISO 9001</option>
          <option value="ISO 14001">ISO 14001</option>
          <option value="ISO 45001">ISO 45001</option>
        </select>

        <input
          type="text"
          placeholder="Chapitre audité"
          value={chapitre}
          onChange={(e) => setChapitre(e.target.value)}
        />

        <input
          type="text"
          placeholder="Auditeur"
          value={auditeur}
          onChange={(e) => setAuditeur(e.target.value)}
        />

        <select
          value={resultat}
          onChange={(e) => setResultat(e.target.value)}
        >
          <option value="">Choisir un résultat</option>
          <option value="Conforme">Conforme</option>
          <option value="Observation">Observation</option>
          <option value="Non-conformité">Non-conformité</option>
        </select>

        <input
          type="date"
          value={dateAudit}
          onChange={(e) => setDateAudit(e.target.value)}
        />

        <textarea
          placeholder="Observation"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />

        <button type="submit">Ajouter l'audit</button>
      </form>

      {messageErreur && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          {messageErreur}
        </div>
      )}

      <h2>Liste des audits</h2>

      <p>Nombre d'audits : {audits.length}</p>

      <div className="list-container">
        {audits.map((audit) => (
          <div key={audit.id} className="item-card">
            <h3>{audit.norme}</h3>

            <p>
              <strong>Chapitre :</strong> {audit.chapitre}
            </p>

            <p>
              <strong>Auditeur :</strong> {audit.auditeur}
            </p>

            <p>
              <strong>Résultat :</strong>{" "}
              <span
                style={{
                  color: couleurResultat(audit.resultat),
                  fontWeight: "bold",
                }}
              >
                {audit.resultat}
              </span>
            </p>

            <p>
              <strong>Date d'audit :</strong>{" "}
              {formatDate(audit.date_audit)}
            </p>

            <p>
              <strong>Observation :</strong> {audit.observation}
            </p>

            <button onClick={() => supprimerAudit(audit.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}