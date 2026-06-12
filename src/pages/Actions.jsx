import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Actions() {
  const [actions, setActions] = useState([]);

  const [titre, setTitre] = useState("");
  const [responsable, setResponsable] = useState("");
  const [statut, setStatut] = useState("ouverte");
  const [echeance, setEcheance] = useState("");

  async function loadActions() {
    const { data, error } = await supabase
      .from("actions_correctives")
      .select("*")
      .order("echeance", { ascending: true });

    if (error) {
      alert("Erreur lors du chargement des actions");
      console.error(error);
      return;
    }

    setActions(data || []);
  }

  useEffect(() => {
    loadActions();
  }, []);

  async function ajouterAction(event) {
    event.preventDefault();

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
    setStatut("ouverte");
    setEcheance("");

    loadActions();
  }

  async function supprimerAction(id) {
    const confirmation = confirm("Supprimer cette action ?");

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

    loadActions();
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
              <strong>Statut :</strong> {action.statut}
            </p>

            <p>
              <strong>Échéance :</strong> {action.echeance}
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