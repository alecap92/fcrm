import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Esta función se ejecuta sincrónicamente antes de cualquier renderizado
    const syncAuth = () => {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("auth_user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);

          // Check current Zustand state
          const currentState = useAuthStore.getState();

          if (!currentState.isAuthenticated || !currentState.token) {
            useAuthStore.setState({
              user,
              token,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }

      setIsInitialized(true);
    };

    syncAuth();

    return () => {};
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
