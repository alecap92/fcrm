// components/auth/AuthInitializer.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
// components/auth/AuthInitializer.tsx
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("AuthInitializer - useEffect start");
    // Esta función se ejecuta sincrónicamente antes de cualquier renderizado
    const syncAuth = () => {
      console.log("AuthInitializer - syncAuth start");
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("auth_user");

      console.log("AuthInitializer - localStorage check", {
        hasToken: !!token,
        hasUser: !!userStr,
      });

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);

          // Check current Zustand state
          const currentState = useAuthStore.getState();
          console.log("AuthInitializer - Current Zustand state", {
            isAuthenticated: currentState.isAuthenticated,
            hasUser: !!currentState.user,
            hasToken: !!currentState.token,
          });

          if (!currentState.isAuthenticated || !currentState.token) {
            console.log("AuthInitializer - Updating Zustand state");
            useAuthStore.setState({
              user,
              token,
              isAuthenticated: true,
            });
          }

          console.log("Auth state initialized from localStorage");
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }

      setIsInitialized(true);
      console.log(
        "AuthInitializer - syncAuth complete, isInitialized set to true"
      );
    };

    syncAuth();

    return () => {
      console.log("AuthInitializer - useEffect cleanup");
    };
  }, []);

  console.log("AuthInitializer - Rendering", { isInitialized });

  if (!isInitialized) {
    console.log("AuthInitializer - Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("AuthInitializer - Rendering children");
  return <>{children}</>;
}
