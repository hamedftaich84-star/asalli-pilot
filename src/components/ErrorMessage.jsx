export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "20px",
        fontWeight: "bold",
      }}
    >
      {message}
    </div>
  );
}