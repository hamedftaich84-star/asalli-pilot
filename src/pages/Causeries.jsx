import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Causeries() {
  const [causeries, setCauseries] = useState([]);

  const [titre, setTitre] = useState("");
  const [animateur, setAnimateur] = useState("");
  const [dateCauserie, setDateCauserie] = useState("");
  const [participants, setParticipants] = useState("");
  const [observations, setObservations] = useState("");

  async function loadCauseries() {
    const { data, error } = await supabase
      .from("causeries_sse")
      .select("*")
      .order("date_causerie", { ascending: false });

    if (error) {
      console.error("Erreur chargement causeries :", error);
      return;
    }

    setCauseries(data || []);
  }

  useEffect(() => {
    loadCauseries();
  }, []);

  async function ajouterCauserie(event) {
    event.preventDefault();

    const { error } = await supabase.from("causeries_sse").insert([
      {
        titre: titre,
        animateur: animateur,
        date_causerie: dateCauserie,
        participants: Number(participants),
        observations: observations,
      },
    ]);

    if (error) {
      alert("Erreur lors de l'ajout de la causerie");
      console.error(error);
      return;
    }

    setTitre("");
    setAnimateur("");
    setDateCauserie("");
    setParticipants("");
    setObservations("");

    loadCauseries();
  }

  async function supprimerCauserie(id) {
    const confirmation = confirm("Supprimer cette causerie ?");

    if (!confirmation) return;

    const { error } = await supabase
      .from("causeries_sse")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
      return;
    }

    loadCauseries();
  }

  return (
    <div className="page-container">
      <h1>Causeries SSE</h1>

      <form className="form-card" onSubmit={ajouterCauserie}>
        <input
          type="text"
          placeholder="Titre de la causerie"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Animateur"
          value={animateur}
          onChange={(e) => setAnimateur(e.target.value)}
          required
        />

        <input
          type="date"
          value={dateCauserie}
          onChange={(e) => setDateCauserie(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Nombre de participants"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          required
        />

        <textarea
          placeholder="Observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />

        <button type="submit">Ajouter la causerie</button>
      </form>

      <h2>Liste des causeries</h2>

      <div className="list-container">
        {causeries.map((c) => (
          <div key={c.id} className="item-card">
            <h3>{c.titre}</h3>

            <p>
              <strong>Animateur :</strong> {c.animateur}
            </p>

            <p>
              <strong>Date :</strong> {c.date_causerie}
            </p>

            <p>
              <strong>Participants :</strong> {c.participants}
            </p>

            <p>
              <strong>Observations :</strong> {c.observations}
            </p>

            <button onClick={() => supprimerCauserie(c.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}