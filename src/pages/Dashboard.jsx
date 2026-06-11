import { useEffect, useState } from "react";
import PDCAWheel from "../components/PDCAWheel";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [nbCauseries, setNbCauseries] = useState(0);
  const [nbVisites, setNbVisites] = useState(0);
  const [nbRex, setNbRex] = useState(0);

  useEffect(() => {
    async function loadData() {
      const usersResult = await supabase.from("users").select("*");
      if (!usersResult.error) setUsers(usersResult.data || []);

      const causeriesResult = await supabase.from("causeries_sse").select("*");
      if (!causeriesResult.error) setNbCauseries(causeriesResult.data.length);

      const visitesResult = await supabase.from("visites_sse").select("*");
      if (!visitesResult.error) setNbVisites(visitesResult.data.length);

      const rexResult = await supabase.from("rex").select("*");
      if (!rexResult.error) setNbRex(rexResult.data.length);
    }

    loadData();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Tableau de bord ASALLI Pilot</h1>

      <h2>Indicateurs</h2>

      <div>
        <p>Utilisateurs : {users.length}</p>
        <p>Causeries SSE : {nbCauseries}</p>
        <p>Visites SSE : {nbVisites}</p>
        <p>REX : {nbRex}</p>
        <p>Actions : 0</p>
        <p>Audits : 0</p>
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