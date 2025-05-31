import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ui/toast";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkflowProvider } from "./contexts/WorkflowContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ChatProvider } from "./contexts/ChatContext";
import { DealsProvider } from "./contexts/DealsContext";
import { AuthInitializer } from "./components/auth/AuthInitializer";
import App from "./App.tsx";
import "./index.css";
import { AutomationProvider } from "./contexts/AutomationContext.tsx";

// Importar utilidades de debug en desarrollo
if (import.meta.env.DEV) {
  import("./utils/debugAuth");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <AuthInitializer>
          <AuthProvider>
            <WorkflowProvider>
              <LoadingProvider>
                <ChatProvider>
                  <DealsProvider>
                    <AutomationProvider>
                      <App />
                    </AutomationProvider>
                  </DealsProvider>
                </ChatProvider>
              </LoadingProvider>
            </WorkflowProvider>
          </AuthProvider>
        </AuthInitializer>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
