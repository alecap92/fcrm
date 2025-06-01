import React from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "./components/providers";
import App from "./App.tsx";
import "./index.css";

// Importar utilidades de debug en desarrollo
if (import.meta.env.DEV) {
  import("./utils/debugAuth");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
