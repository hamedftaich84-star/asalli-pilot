import { useNavigate } from "react-router-dom";

export default function PDCAWheel({ counts = { P: 0, D: 0, C: 0, A: 0 } }) {
  const navigate = useNavigate();

  const categories = [
    {
      key: "P",
      letter: "P",
      label: "Planifier",
      desc: "Audits ISO & Planification",
      colorClass: "quadrant-p",
      count: counts.P,
      route: "/audits",
    },
    {
      key: "D",
      letter: "D",
      label: "Réaliser",
      desc: "Causeries SSE Terrain",
      colorClass: "quadrant-d",
      count: counts.D,
      route: "/causeries",
    },
    {
      key: "C",
      letter: "C",
      label: "Vérifier",
      desc: "Visites de Sécurité",
      colorClass: "quadrant-c",
      count: counts.C,
      route: "/visites",
    },
    {
      key: "A",
      letter: "A",
      label: "Agir",
      desc: "REX & Actions Correctives",
      colorClass: "quadrant-a",
      count: counts.A,
      route: "/rex",
    },
  ];

  return (
    <div className="wheel-container">
      <div className="pdca-outer-ring">
        <div className="pdca-wheel">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => navigate(cat.route)}
              className={`wheel-quadrant ${cat.colorClass}`}
              title={`${cat.label} - ${cat.desc}`}
              style={{ border: "none" }}
            >
              <div className="quadrant-content">
                <span className="quadrant-letter">{cat.letter}</span>
                <span className="quadrant-label">{cat.label}</span>
                <span className="quadrant-count">
                  {cat.count} enregistrement{cat.count > 1 ? "s" : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}