import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ActionsChart({ ouvertes, enCours, cloturees }) {
  const data = [
    { name: "Ouvertes", value: ouvertes },
    { name: "En cours", value: enCours },
    { name: "Clôturées", value: cloturees },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginTop: "30px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Répartition des actions correctives
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={120} label>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}