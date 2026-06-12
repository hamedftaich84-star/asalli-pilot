import { useEffect, useState } from "react";
import PDCAWheel from "../components/PDCAWheel";
import { supabase } from "../services/supabase";
import "../App.css";

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
    <div className="dashboard-page">
      <h1>Tableau de bord ASALLI Pilot</h1>

      <h2>Indicateurs</h2>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Utilisateurs</span>
          <strong>{users.length}</strong>
        </div>

        <div className="kpi-card">
          <span>Causeries SSE</span>
          <strong>{nbCauseries}</strong>
        </div>

        <div className="kpi-card">
          <span>Visites SSE</span>
          <strong>{nbVisites}</strong>
        </div>

        <div className="kpi-card">
          <span>REX</span>
          <strong>{nbRex}</strong>
        </div>

        <div className="kpi-card">
          <span>Actions</span>
          <strong>{nbActions}</strong>
        </div>

        <div className="kpi-card">
          <span>Audits</span>
          <strong>{nbAudits}</strong>
        </div>
      </div>

      <div className="dashboard-section">
        <PDCAWheel />
      </div>

      <h2>Utilisateurs</h2>

      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="user-line">
            {user.prenom} {user.nom} — {user.role}
          </div>
        ))}
      </div>
    </div>
  );
}