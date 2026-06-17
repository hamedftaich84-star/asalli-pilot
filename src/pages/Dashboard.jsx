import { useEffect, useState } from "react";
import PDCAWheel from "../components/PDCAWheel";
import ActionsChart from "../components/ActionsChart";
import AuditsChart from "../components/AuditsChart";
import { supabase } from "../services/supabase";
import { exportDashboardPdf } from "../services/exportDashboardPdf";
import { Download, AlertTriangle, Clock } from "lucide-react";

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
  const [actionsEcheanceProche, setActionsEcheanceProche] = useState(0);

  const [auditsIso9001, setAuditsIso9001] = useState(0);
  const [auditsIso14001, setAuditsIso14001] = useState(0);
  const [auditsIso45001, setAuditsIso45001] = useState(0);

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
      if (!auditsResult.error) {
        const audits = auditsResult.data || [];
        setNbAudits(audits.length);
        setAuditsIso9001(audits.filter((audit) => audit.norme === "ISO 9001").length);
        setAuditsIso14001(audits.filter((audit) => audit.norme === "ISO 14001").length);
        setAuditsIso45001(audits.filter((audit) => audit.norme === "ISO 45001").length);
      }

      const actionsResult = await supabase.from("actions_correctives").select("*");
      if (!actionsResult.error) {
        const actions = actionsResult.data || [];
        const todayDate = new Date();

        setActionsOuvertes(actions.filter((action) => action.statut === "ouverte").length);
        setActionsEnCours(actions.filter((action) => action.statut === "en cours").length);
        setActionsCloturees(actions.filter((action) => action.statut === "cloturee").length);

        const retard = actions.filter((action) => {
          if (!action.echeance || action.statut === "cloturee") return false;
          const echeance = new Date(action.echeance);
          return echeance < todayDate;
        }).length;

        const proche = actions.filter((action) => {
          if (!action.echeance || action.statut === "cloturee") return false;
          const echeance = new Date(action.echeance);
          const diffJours = (echeance - todayDate) / (1000 * 60 * 60 * 24);
          return diffJours >= 0 && diffJours <= 7;
        }).length;

        setActionsEnRetard(retard);
        setActionsEcheanceProche(proche);
      }
    }

    loadData();
  }, []);

  function exporterDashboard() {
    exportDashboardPdf({
      utilisateurs: users.length,
      causeries: nbCauseries,
      visites: nbVisites,
      rex: nbRex,
      audits: nbAudits,
      actionsOuvertes,
      actionsEnCours,
      actionsCloturees,
      actionsEnRetard,
      actionsEcheanceProche,
      auditsIso9001,
      auditsIso14001,
      auditsIso45001,
    });
  }

  return (
    <div className="dashboard-page">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "var(--text-main)", margin: 0 }}>Tableau de bord ASALLI Pilot</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>Suivi de l'amélioration continue et de la conformité SSE</p>
        </div>

        <button
          onClick={exporterDashboard}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Download size={18} /> Export PDF Dashboard
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Utilisateurs</span>
          <strong>{users.length}</strong>
        </div>

        <div className="kpi-card">
          <span>Causeries SSE</span>
          <strong style={{ color: "var(--color-d-do)" }}>{nbCauseries}</strong>
        </div>

        <div className="kpi-card">
          <span>Visites SSE</span>
          <strong style={{ color: "var(--color-c-check)" }}>{nbVisites}</strong>
        </div>

        <div className="kpi-card">
          <span>REX Déclarés</span>
          <strong style={{ color: "var(--color-a-act)" }}>{nbRex}</strong>
        </div>

        <div className="kpi-card">
          <span>Audits ISO</span>
          <strong style={{ color: "var(--color-p-plan)" }}>{nbAudits}</strong>
        </div>

        <div className="kpi-card">
          <span>Actions en Retard</span>
          <strong style={{ color: actionsEnRetard > 0 ? "var(--color-a-act)" : "var(--color-d-do)" }}>
            {actionsEnRetard}
          </strong>
        </div>

        <div className="kpi-card">
          <span>Échéance ≤ 7 jours</span>
          <strong style={{ color: actionsEcheanceProche > 0 ? "var(--color-c-check)" : "var(--text-muted)" }}>
            {actionsEcheanceProche}
          </strong>
        </div>

        <div className="kpi-card">
          <span>Ratio Clôturé</span>
          <strong style={{ color: "var(--color-d-do)" }}>
            {actionsOuvertes + actionsEnCours + actionsCloturees > 0
              ? `${Math.round((actionsCloturees / (actionsOuvertes + actionsEnCours + actionsCloturees)) * 100)}%`
              : "0%"}
          </strong>
        </div>
      </div>

      {actionsEnRetard > 0 && (
        <div
          style={{
            background: "hsl(350, 89%, 95%)",
            color: "hsl(350, 89%, 30%)",
            border: "1px solid hsl(350, 89%, 85%)",
            padding: "15px",
            borderRadius: "var(--radius-sm)",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle size={20} /> Attention : {actionsEnRetard} action(s) corrective(s) en retard !
        </div>
      )}

      {actionsEcheanceProche > 0 && (
        <div
          style={{
            background: "hsl(38, 92%, 95%)",
            color: "hsl(38, 92%, 30%)",
            border: "1px solid hsl(38, 92%, 85%)",
            padding: "15px",
            borderRadius: "var(--radius-sm)",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <Clock size={20} /> Alerte : {actionsEcheanceProche} action(s) arrivent à échéance dans les 7 jours.
        </div>
      )}

      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text-main)", margin: 0 }}>Roue de Deming Interactive</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>Cliquez sur les quadrants pour accéder directement aux formulaires associés</p>
        <PDCAWheel counts={{ P: nbAudits, D: nbCauseries, C: nbVisites, A: nbRex }} />
      </div>

      <div className="charts-grid">
        <ActionsChart
          ouvertes={actionsOuvertes}
          enCours={actionsEnCours}
          cloturees={actionsCloturees}
        />

        <AuditsChart
          iso9001={auditsIso9001}
          iso14001={auditsIso14001}
          iso45001={auditsIso45001}
        />
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1.1rem", color: "var(--text-main)", marginBottom: "1rem" }}>Utilisateurs connectés</h3>
        <div className="users-list">
          {users.map((user) => (
            <div key={user.id} className="user-line">
              <span>{user.prenom} {user.nom}</span>
              <span className="badge badge-draft" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>{user.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}