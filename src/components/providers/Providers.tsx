import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../ui/toast";
import { AuthProvider } from "../../contexts/AuthContext";
import { WorkflowProvider } from "../../contexts/WorkflowContext";
import { LoadingProvider } from "../../contexts/LoadingContext";
import { ChatProvider } from "../../contexts/ChatContext";
import { DealsProvider } from "../../contexts/DealsContext";
import { AutomationProvider } from "../../contexts/AutomationContext";
import { AuthInitializer } from "../auth/AuthInitializer";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Componente que agrupa todos los providers de contexto de la aplicación
 * Mejora la organización y legibilidad del código
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthInitializer>
          <AuthProvider>
            <WorkflowProvider>
              <LoadingProvider>
                <ChatProvider>
                  <DealsProvider>
                    <AutomationProvider>{children}</AutomationProvider>
                  </DealsProvider>
                </ChatProvider>
              </LoadingProvider>
            </WorkflowProvider>
          </AuthProvider>
        </AuthInitializer>
      </BrowserRouter>
    </ToastProvider>
  );
}
