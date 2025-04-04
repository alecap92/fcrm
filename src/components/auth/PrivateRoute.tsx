// components/auth/PrivateRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
// components/auth/PrivateRoute.tsx
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: contextAuth, isLoading: contextLoading } = useAuth();
  const storeAuth = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  console.log("PrivateRoute - Rendering", {
    contextAuth,
    storeAuth,
    contextLoading,
    isReady,
    path: location.pathname,
  });

  useEffect(() => {
    console.log("PrivateRoute - useEffect start", {
      storeAuth,
      contextAuth,
      path: location.pathname,
    });

    // Priorizar autenticación del store o del localStorage
    if (storeAuth) {
      console.log("PrivateRoute - Store auth found, setting ready");
      setIsReady(true);
      return;
    }

    // Verificar localStorage como respaldo
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");

    console.log("PrivateRoute - localStorage check", {
      hasToken: !!token,
      hasUser: !!userStr,
    });

    if (token && userStr) {
      try {
        // Actualizar el store si es necesario
        const user = JSON.parse(userStr);
        console.log("PrivateRoute - Updating auth store from localStorage");
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
      // No hay datos de autenticación
      console.log("PrivateRoute - No auth data found, setting ready anyway");
      setIsReady(true);
    }
  }, [storeAuth, contextAuth]);

  // Mostrar spinner mientras verificamos
  if (!isReady || contextLoading) {
    console.log("PrivateRoute - Showing loading spinner", {
      isReady,
      contextLoading,
    });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Usar la combinación de ambas fuentes de autenticación
  const isUserAuthenticated = contextAuth || storeAuth;
  console.log("PrivateRoute - Auth check result", {
    isUserAuthenticated,
    contextAuth,
    storeAuth,
    willRedirect: !isUserAuthenticated,
  });

  if (!isUserAuthenticated) {
    console.log("PrivateRoute - Redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log("PrivateRoute - Rendering children");
  return <>{children}</>;
}
