import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Causeries() {
  const [causeries, setCauseries] = useState([]);

  const [titre, setTitre] = useState("");
  const [animateur, setAnimateur] = useState("");
  const [dateCauserie, setDateCauserie] = useState("");
  const [participants, setParticipants] = useState(0);
  const [observations, setObservations] = useState("");

  async function chargerCauseries() {
    const { data, error } = await supabase
      .from("causeries_sse")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement causeries :", error);
      return;
    }

    setCauseries(data || []);
  }

  useEffect(() => {
    chargerCauseries();
  }, []);

  async function ajouterCauserie(event) {
    event.preventDefault();

    const { error } = await supabase.from("causeries_sse").insert([
      {
        titre,
        animateur,
        date_causerie: dateCauserie,
        participants: Number(participants),
        observations,
      },
    ]);

    if (error) {
      alert("Erreur lors de l'enregistrement");
      console.error(error);
      return;
    }

    setTitre("");
    setAnimateur("");
    setDateCauserie("");
    setParticipants(0);
    setObservations("");

    chargerCauseries();
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Causeries SSE</h1>

      <form
        onSubmit={ajouterCauserie}
        style={{
          display: "grid",
          gap: "10px",
          maxWidth: "500px",
          marginBottom: "30px",
        }}
      >
        <input
          placeholder="Titre de la causerie"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <input
          placeholder="Animateur"
          value={animateur}
          onChange={(e) => setAnimateur(e.target.value)}
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
        />

        <textarea
          placeholder="Observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />

        <button type="submit">Enregistrer la causerie</button>
      </form>

      <h2>Liste des causeries</h2>

      {causeries.map((causerie) => (
        <div
          key={causerie.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
          }}
        >
          <strong>{causerie.titre}</strong>
          <p>Animateur : {causerie.animateur}</p>
          <p>Date : {causerie.date_causerie}</p>
          <p>Participants : {causerie.participants}</p>
          <p>Observations : {causerie.observations}</p>
        </div>
      ))}
    </div>
  );
}