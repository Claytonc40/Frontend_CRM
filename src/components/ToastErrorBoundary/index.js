import React from "react";
import { Toaster } from "sonner";

class ToastErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro no Toast:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Não renderiza o toast em caso de erro
    }

    return (
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
            padding: "16px",
          },
          success: {
            style: {
              background: "#4caf50",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "#f44336",
              color: "#fff",
            },
          },
        }}
      />
    );
  }
}

export default ToastErrorBoundary;
