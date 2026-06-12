import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "15px",
        background: "#1f2937",
        display: "flex",
        gap: "20px",
      }}
    >
      <Link style={{ color: "white" }} to="/">Dashboard</Link>
      <Link style={{ color: "white" }} to="/causeries">Causeries</Link>
      <Link style={{ color: "white" }} to="/visites">Visites</Link>
      <Link style={{ color: "white" }} to="/rex">REX</Link>
      <Link style={{ color: "white" }} to="/actions">Actions</Link>
      <Link style={{ color: "white" }} to="/audits">Audits</Link>
    </nav>
  );
}