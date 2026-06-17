export default function PageLayout({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.8rem", color: "var(--text-main)", margin: 0 }}>{title}</h1>
      </div>
      {children}
    </div>
  );
}