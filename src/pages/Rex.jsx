import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Rex() {
  const [rex, setRex] = useState([]);
  const [message, setMessage] = useState("");

  const [typeRex, setTypeRex] = useState("");
  const [description, setDescription] = useState("");
  const [declarant, setDeclarant] = useState("");
  const [dateRex, setDateRex] = useState("");
  const [actions, setActions] = useState("");

  async function loadRex() {
    const { data, error } = await supabase
      .from("rex")
      .select("*")
      .order("date_rex", { ascending: false });

    if (error) {
      setMessage("Erreur lors du chargement des REX");
      console.error(error);
      return;
    }

    setRex(data || []);
  }

  useEffect(() => {
    loadRex();
  }, []);

  async function ajouterRex(event) {
    event.preventDefault();
    setMessage("");

    const { error } = await supabase.from("rex").insert([
      {
        type_rex: typeRex,
        description,
        declarant,
        date_rex: dateRex,
        actions,
      },
    ]);

    if (error) {
      setMessage("Erreur lors de l'ajout du REX");
      console.error(error);
      return;
    }

    setTypeRex("");
    setDescription("");
    setDeclarant("");
    setDateRex("");
    setActions("");

    loadRex();

    setMessage("REX ajouté avec succès.");
  }

  async function supprimerRex(id) {
    const confirmation = confirm("Supprimer ce REX ?");

    if (!confirmation) return;

    const { error } = await supabase
      .from("rex")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Erreur lors de la suppression");
      console.error(error);
      return;
    }

    loadRex();
  }

  async function creerActionCorrective(item) {
    setMessage("");

    const date = new Date();
    date.setDate(date.getDate() + 30);

    const echeance = date.toISOString().split("T")[0];

    const titreAction =
      item.description && item.description.length > 80
        ? `Action corrective - ${item.description.substring(0, 80)}...`
        : `Action corrective - ${item.description}`;

    const { error } = await supabase
      .from("actions_correctives")
      .insert([
        {
          titre: titreAction,
          responsable: "",
          statut: "ouverte",
          echeance,
        },
      ]);

    if (error) {
      setMessage("Erreur lors de la création de l'action corrective");
      console.error(error);
      return;
    }

    setMessage(
      "Action corrective créée avec succès dans le module Actions."
    );
  }

  return (
    <div className="page-container">
      <h1>REX</h1>

      <form className="form-card" onSubmit={ajouterRex}>
        <select
          value={typeRex}
          onChange={(e) => setTypeRex(e.target.value)}
          required
        >
          <option value="">Type de REX</option>
          <option value="Accident">Accident</option>
          <option value="Presqu'accident">Presqu'accident</option>
          <option value="Situation dangereuse">Situation dangereuse</option>
          <option value="Bonne pratique">Bonne pratique</option>
        </select>

        <input
          type="text"
          placeholder="Déclarant"
          value={declarant}
          onChange={(e) => setDeclarant(e.target.value)}
          required
        />

        <input
          type="date"
          value={dateRex}
          onChange={(e) => setDateRex(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <textarea
          placeholder="Actions décidées"
          value={actions}
          onChange={(e) => setActions(e.target.value)}
        />

        <button type="submit">
          Ajouter le REX
        </button>
      </form>

      {message && (
        <div
          style={{
            background: "#dbeafe",
            color: "#1e40af",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      <h2>Liste des REX</h2>

      <p>Nombre de REX : {rex.length}</p>

      <div className="list-container">
        {rex.map((item) => (
          <div key={item.id} className="item-card">
            <h3>{item.type_rex}</h3>

            <p>
              <strong>Déclarant :</strong> {item.declarant}
            </p>

            <p>
              <strong>Date :</strong> {item.date_rex}
            </p>

            <p>
              <strong>Description :</strong> {item.description}
            </p>

            <p>
              <strong>Actions décidées :</strong> {item.actions}
            </p>

            <button
              onClick={() => creerActionCorrective(item)}
            >
              Créer une action corrective
            </button>

            <button
              onClick={() => supprimerRex(item.id)}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}