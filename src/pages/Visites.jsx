import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Visites() {
  const [visites, setVisites] = useState([]);

  const [site, setSite] = useState("");
  const [visiteur, setVisiteur] = useState("");
  const [dateVisite, setDateVisite] = useState("");
  const [observations, setObservations] = useState("");

  async function loadVisites() {
    const { data, error } = await supabase
      .from("visites_sse")
      .select("*")
      .order("date_visite", { ascending: false });

    if (error) {
      alert("Erreur lors du chargement des visites");
      console.error(error);
      return;
    }

    setVisites(data || []);
  }

  useEffect(() => {
    loadVisites();
  }, []);

  async function ajouterVisite(event) {
    event.preventDefault();

    const { error } = await supabase.from("visites_sse").insert([
      {
        site,
        visiteur,
        date_visite: dateVisite,
        observations,
      },
    ]);

    if (error) {
      alert("Erreur lors de l'ajout de la visite");
      console.error(error);
      return;
    }

    setSite("");
    setVisiteur("");
    setDateVisite("");
    setObservations("");

    loadVisites();
  }

  async function supprimerVisite(id) {
    const confirmation = confirm("Supprimer cette visite ?");

    if (!confirmation) return;

    const { error } = await supabase
      .from("visites_sse")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
      return;
    }

    loadVisites();
  }

  return (
    <div className="page-container">
      <h1>Visites SSE</h1>

      <form className="form-card" onSubmit={ajouterVisite}>
        <input
          type="text"
          placeholder="Site visité"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Visiteur"
          value={visiteur}
          onChange={(e) => setVisiteur(e.target.value)}
          required
        />

        <input
          type="date"
          value={dateVisite}
          onChange={(e) => setDateVisite(e.target.value)}
          required
        />

        <textarea
          placeholder="Observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />

        <button type="submit">Ajouter la visite</button>
      </form>

      <h2>Liste des visites</h2>

      <p>Nombre de visites : {visites.length}</p>

      <div className="list-container">
        {visites.map((visite) => (
          <div key={visite.id} className="item-card">
            <h3>{visite.site}</h3>

            <p>
              <strong>Visiteur :</strong> {visite.visiteur}
            </p>

            <p>
              <strong>Date :</strong> {visite.date_visite}
            </p>

            <p>
              <strong>Observations :</strong> {visite.observations}
            </p>

            <button onClick={() => supprimerVisite(visite.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}