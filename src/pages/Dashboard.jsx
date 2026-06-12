import { useEffect, useState } from "react";
import PDCAWheel from "../components/PDCAWheel";
import { supabase } from "../services/supabase";
import "../App.css";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [nbCauseries, setNbCauseries] = useState(0);
  const [nbVisites, setNbVisites] = useState(0);
  const [nbRex, setNbRex] = useState(0);
  const [nbAudits, setNbAudits] = useState(0);

  const [actionsOuvertes, setActionsOuvertes] = useState(0);
  const [actionsEnCours, setActionsEnCours] = useState(0);
  const [actionsCloturees, setActionsCloturees] = useState(0);
  const [actionsEnRetard, setActionsEnRetard] = useState(0);

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

      const auditsResult = await supabase.from("audits_iso").select("*");
      if (!auditsResult.error) setNbAudits(auditsResult.data.length);

      const actionsResult = await supabase
        .from("actions_correctives")
        .select("*");

      if (!actionsResult.error) {
        const actions = actionsResult.data || [];
        const today = new Date().toISOString().split("T")[0];

        setActionsOuvertes(
          actions.filter((a) => a.statut === "ouverte").length
        );

        setActionsEnCours(
          actions.filter((a) => a.statut === "en cours").length
        );

        setActionsCloturees(
          actions.filter((a) => a.statut === "cloturee").length
        );

        setActionsEnRetard(
          actions.filter(
            (a) =>
              a.echeance &&
              a.echeance < today &&
              a.statut !== "cloturee"
          ).length
        );
      }
    }

    loadData();
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord ASALLI Pilot</h1>

      <h2>Indicateurs QSE</h2>

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
          <span>Audits ISO</span>
          <strong>{nbAudits}</strong>
        </div>

        <div className="kpi-card">
          <span>Actions en retard</span>
          <strong style={{ color: actionsEnRetard > 0 ? "red" : "green" }}>
            {actionsEnRetard}
          </strong>
        </div>

        <div className="kpi-card">
          <span>Actions ouvertes</span>
          <strong style={{ color: "red" }}>{actionsOuvertes}</strong>
        </div>

        <div className="kpi-card">
          <span>Actions en cours</span>
          <strong style={{ color: "orange" }}>{actionsEnCours}</strong>
        </div>

        <div className="kpi-card">
          <span>Actions clôturées</span>
          <strong style={{ color: "green" }}>{actionsCloturees}</strong>
        </div>
      </div>

      {actionsEnRetard > 0 && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "25px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          ⚠ {actionsEnRetard} action(s) corrective(s) en retard
        </div>
      )}

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