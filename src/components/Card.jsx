export default function Card({ children }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "15px",
        backgroundColor: "white",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  );
}