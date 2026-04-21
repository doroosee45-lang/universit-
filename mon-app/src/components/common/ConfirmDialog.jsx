export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        width: 300
      }}>
        <h3>{title}</h3>
        <p>{message}</p>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button onClick={onCancel}>Annuler</button>
          <button onClick={onConfirm} style={{ color: "red" }}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}