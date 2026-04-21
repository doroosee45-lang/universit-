export default function Alert({ type = "error", message }) {
  if (!message) return null;

  return (
    <div style={{
      padding: "10px",
      borderRadius: "8px",
      background: type === "error" ? "#fee2e2" : "#dcfce7",
      color: "#000"
    }}>
      {message}
    </div>
  );
}