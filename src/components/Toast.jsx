import { createContext, useState, useContext, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          let Icon = Info;
          let toastClass = "toast-info";
          if (toast.type === "success") {
            Icon = CheckCircle;
            toastClass = "toast-success";
          } else if (toast.type === "error") {
            Icon = AlertTriangle;
            toastClass = "toast-error";
          }

          return (
            <div key={toast.id} className={`toast ${toastClass}`}>
              <Icon size={20} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600 }}>{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  color: "inherit",
                  opacity: 0.7
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
