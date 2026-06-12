import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AuditsChart({ iso9001, iso14001, iso45001 }) {
  const data = [
    { norme: "ISO 9001", audits: iso9001 },
    { norme: "ISO 14001", audits: iso14001 },
    { norme: "ISO 45001", audits: iso45001 },
  ];

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
        Audits par norme
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis dataKey="norme" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="audits" fill="#1f2937" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}