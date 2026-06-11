export default function PDCAWheel() {
  const items = [
    { label: "PLAN", text: "Préparer" },
    { label: "DO", text: "Réaliser" },
    { label: "CHECK", text: "Vérifier" },
    { label: "ACT", text: "Améliorer" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 420 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            border: "1px solid #ddd",
            padding: 30,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {item.label}
          <br />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}