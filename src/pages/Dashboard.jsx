import { useEffect, useState } from "react";
import PDCAWheel from "../components/PDCAWheel";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("*");

      if (error) {
  console.error("Erreur Supabase :", error);
  alert(JSON.stringify(error));
  return;
}

      console.log("Données Supabase :", data);
console.log("Erreur Supabase :", error);
setUsers(data || []);
    }

    loadUsers();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Tableau de bord ASALLI Pilot</h1>

      <h2>Indicateurs</h2>

      <div>
        <p>Utilisateurs : {users.length}</p>
        <p>Causeries SSE : 0</p>
        <p>Visites SSE : 0</p>
        <p>REX : 0</p>
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