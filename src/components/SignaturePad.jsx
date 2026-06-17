import { useEffect, useRef, useState } from "react";

export default function SignaturePad({ onSave, initialData, isReadOnly, label }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!initialData);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    
    // Set drawing style
    ctx.strokeStyle = "hsl(220, 90%, 20%)"; // Dark ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // If initial image exists, draw it
    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialData;
      setIsEmpty(false);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  }, [initialData]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse or touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (isReadOnly) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || isReadOnly) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save signature
    const canvas = canvasRef.current;
    const dataUri = canvas.toDataURL();
    onSave(dataUri);
  };

  const clearCanvas = () => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSave("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
          {label} {isReadOnly && " (Lecture seule)"}
        </span>
        {!isReadOnly && !isEmpty && (
          <button 
            type="button" 
            onClick={clearCanvas} 
            style={{
              background: "none",
              border: "none",
              color: "var(--color-a-act)",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Effacer
          </button>
        )}
      </div>
      
      {isReadOnly && initialData ? (
        <div style={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-input)",
          height: "110px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px",
          borderRadius: "var(--radius-xs)"
        }}>
          <img src={initialData} alt="Signature émargée" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
        </div>
      ) : isReadOnly ? (
        <div style={{
          border: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-input)",
          height: "110px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          fontStyle: "italic",
          borderRadius: "var(--radius-xs)"
        }}>
          Non signée
        </div>
      ) : (
        <div className="signature-box" style={{ width: "100%", height: "120px" }}>
          <canvas
            ref={canvasRef}
            width={380}
            height={120}
            className="signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {isEmpty && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              opacity: 0.6
            }}>
              Signez ici avec votre doigt ou souris
            </div>
          )}
        </div>
      )}
    </div>
  );
}
