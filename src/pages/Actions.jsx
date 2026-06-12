import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import PageLayout from "../components/PageLayout";
import ErrorMessage from "../components/ErrorMessage";

export default function Actions() {
  const [actions, setActions] = useState([]);

  const [titre, setTitre] = useState("");
  const [responsable, setResponsable] = useState("");
  const [statut, setStatut] = useState("");
  const [echeance, setEcheance] = useState("");
  const [messageErreur, setMessageErreur] = useState("");

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

    const { error } = await supabase.from("actions_correctives").insert([
      {
        titre,
        responsable,
        statut,
        echeance,
      },
    ]);

    if (error) {
      setMessageErreur("Erreur lors de l'ajout de l'action");
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
    <PageLayout title="Actions Correctives">
      <form className="form-card" onSubmit={ajouterAction} noValidate>
        <input
          type="text"
          placeholder="Titre de l'action"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
        />

        <input
          type="text"
          placeholder="Responsable"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
        />

        <select value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Choisir un statut</option>
          <option value="ouverte">Ouverte</option>
          <option value="en cours">En cours</option>
          <option value="cloturee">Clôturée</option>
        </select>

        <input
          type="date"
          value={echeance}
          onChange={(e) => setEcheance(e.target.value)}
        />

        <button type="submit">Ajouter l'action</button>
      </form>

      <ErrorMessage message={messageErreur} />

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
              <strong>Date d'échéance :</strong> {formatDate(action.echeance)}
            </p>

            <button onClick={() => supprimerAction(action.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}