import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ui/toast";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkflowProvider } from "./contexts/WorkflowContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { AuthInitializer } from "./components/auth/AuthInitializer";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <AuthInitializer>
          <AuthProvider>
            <WorkflowProvider>
              <LoadingProvider>
                <App />
              </LoadingProvider>
            </WorkflowProvider>
          </AuthProvider>
        </AuthInitializer>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);
