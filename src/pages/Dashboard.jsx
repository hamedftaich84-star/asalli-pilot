import { useEffect, useState } from "react";
import PDCAWheel from "../components/PDCAWheel";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [nbCauseries, setNbCauseries] = useState(0);
  const [nbVisites, setNbVisites] = useState(0);
  const [nbRex, setNbRex] = useState(0);
  const [nbActions, setNbActions] = useState(0);
  const [nbAudits, setNbAudits] = useState(0);

  useEffect(() => {
    async function countTable(table, setter) {
      const { data, error } = await supabase.from(table).select("*");

      if (error) {
        console.error(`Erreur ${table} :`, error);
        return;
      }

      setter(data?.length || 0);
    }

    async function loadData() {
      const usersResult = await supabase.from("users").select("*");

      if (!usersResult.error) {
        setUsers(usersResult.data || []);
      }

      countTable("causeries_sse", setNbCauseries);
      countTable("visites_sse", setNbVisites);
      countTable("rex", setNbRex);
      countTable("actions_correctives", setNbActions);
      countTable("audits_iso", setNbAudits);
    }

    loadData();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1>Tableau de bord ASALLI Pilot</h1>

      <h2>Indicateurs</h2>

      <div>
        <p>Utilisateurs : {users.length}</p>
        <p>Causeries SSE : {nbCauseries}</p>
        <p>Visites SSE : {nbVisites}</p>
        <p>REX : {nbRex}</p>
        <p>Actions : {nbActions}</p>
        <p>Audits : {nbAudits}</p>
      </div>

      <PDCAWheel />

      <h2>Utilisateurs</h2>

      {users.map((user) => (
        <div key={user.id}>
          {user.prenom} {user.nom} — {user.role}
        </div>
      ))}
    </div>
  );
}