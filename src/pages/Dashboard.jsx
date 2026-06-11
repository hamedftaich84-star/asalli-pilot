import PDCAWheel from "../components/PDCAWheel";
export default function Dashboard() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>Tableau de bord ASALLI Pilot</h1>

      <h2>Indicateurs</h2>

      <div>
        <p>Causeries SSE : 0</p>
        <p>Visites SSE : 0</p>
        <p>REX : 0</p>
        <p>Actions : 0</p>
        <p>Audits : 0</p>
      </div>
      <PDCAWheel />
    </div>
  );
}