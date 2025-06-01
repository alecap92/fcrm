import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: contextAuth, isLoading: contextLoading } = useAuth();
  const storeAuth = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verificar autenticación desde múltiples fuentes
    const checkAuth = () => {
      // Priorizar autenticación del store
      if (storeAuth) {
        setIsReady(true);
        return;
      }

      // Verificar localStorage como respaldo
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("auth_user");

      if (token && userStr) {
        try {
          // Actualizar el store si es necesario
          const user = JSON.parse(userStr);

          useAuthStore.setState({
            user,
            token,
            isAuthenticated: true,
          });
          setIsReady(true);
        } catch (error) {
          console.error("Error procesando datos de autenticación:", error);
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }
    };

    checkAuth();
  }, [storeAuth, contextAuth]);

  // Mostrar spinner mientras verificamos
  if (!isReady || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Usar la combinación de ambas fuentes de autenticación
  const isUserAuthenticated = contextAuth || storeAuth;

  if (isUserAuthenticated) {
    console.log("PublicRoute - Usuario autenticado, redirigiendo a dashboard");
    // Redirigir a la página principal si el usuario ya está autenticado
    const from = location.state?.from || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
