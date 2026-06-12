import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Actions() {
  const [actions, setActions] = useState([]);

  const [titre, setTitre] = useState("");
  const [responsable, setResponsable] = useState("");
  const [statut, setStatut] = useState("");
  const [echeance, setEcheance] = useState("");

  async function chargerActions() {
    const { data, error } = await supabase
      .from("actions_correctives")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erreur lors du chargement des actions");
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

    if (!titre || !responsable || !statut || !echeance) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    if (!echeance) {
      alert("Veuillez entrer la date d'échance");
      return;
    }
    const { error } = await supabase.from("actions_correctives").insert([
      {
        titre,
        responsable,
        statut,
        echeance,
      },
    ]);

    if (error) {
      alert("Erreur lors de l'ajout de l'action");
      console.error(error);
      return;
    }

    setTitre("");
    setResponsable("");
    setStatut("");
    setEcheance("");

    chargerActions();
  }

  async function supprimerAction(id) {
    const confirmation = confirm("Supprimer cette action corrective ?");

    if (!confirmation) return;

    const { error } = await supabase
      .from("actions_correctives")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
      return;
    }

    chargerActions();
  }

  function couleurStatut(statut) {
    if (statut === "cloturee") return "green";
    if (statut === "en cours") return "orange";
    return "red";
  }

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR");
  }

  return (
    <div className="page-container">
      <h1>Actions Correctives</h1>

      <form className="form-card" onSubmit={ajouterAction}>
        <input
          type="text"
          placeholder="Titre de l'action"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Responsable"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          required
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          required
        >
          <option value="">Choisir un statut</option>
          <option value="ouverte">Ouverte</option>
          <option value="en cours">En cours</option>
          <option value="cloturee">Clôturée</option>
        </select>

        <input
          type="date"
          value={echeance}
          onChange={(e) => setEcheance(e.target.value)}
          required
        />

        <button type="submit">Ajouter l'action</button>
      </form>

      <h2>Liste des actions</h2>

      <p>Nombre d'actions : {actions.length}</p>

      <div className="list-container">
        {actions.map((action) => (
          <div key={action.id} className="item-card">
            <h3>{action.titre}</h3>

            <p>
              <strong>Responsable :</strong> {action.responsable}
            </p>

            <p>
              <strong>Statut :</strong>{" "}
              <span
                style={{
                  color: couleurStatut(action.statut),
                  fontWeight: "bold",
                }}
              >
                {action.statut}
              </span>
            </p>

            <p>
              <strong>Date de création :</strong>{" "}
              {formatDate(action.created_at)}
            </p>

            <p>
              <strong>Date d'échéance :</strong>{" "}
              {formatDate(action.echeance)}
            </p>

            <button onClick={() => supprimerAction(action.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}