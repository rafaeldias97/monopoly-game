import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Garantir que o localStorage persista mesmo após atualizações do service worker
if ("serviceWorker" in navigator) {
  // Preservar localStorage antes de qualquer atualização
  window.addEventListener("beforeunload", () => {
    // Garantir que o token seja preservado
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token || user) {
      // Forçar persistência
      localStorage.setItem("__preserve_token__", token || "");
      localStorage.setItem("__preserve_user__", user || "");
    }
  });

  // Restaurar token ao carregar a página
  window.addEventListener("load", () => {
    const preservedToken = localStorage.getItem("__preserve_token__");
    const preservedUser = localStorage.getItem("__preserve_user__");

    if (preservedToken && !localStorage.getItem("token")) {
      localStorage.setItem("token", preservedToken);
    }
    if (preservedUser && !localStorage.getItem("user")) {
      localStorage.setItem("user", preservedUser);
    }

    // Limpar chaves temporárias
    if (preservedToken) localStorage.removeItem("__preserve_token__");
    if (preservedUser) localStorage.removeItem("__preserve_user__");
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
