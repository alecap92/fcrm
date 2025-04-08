import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../config/authConfig";
import { useAuthStore } from "../store/authStore"; // Importar Zustand store
import { useSettingsStore } from "../store/settingsStore";
import { useToast } from "../components/ui/toast";
import type { User, LoginCredentials } from "../types/auth";
import { Organization } from "../types/settings";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  organization: Organization;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usar el estado de Zustand
  const zustandAuth = useAuthStore();

  // Inicializar el estado desde la fuente más confiable (priorizar Zustand)
  const [user, setUser] = useState<User | null>(
    zustandAuth.user || authService.getUser()
  );
  const [organization, setOrganization] = useState<Organization>({
    contactProperties: [],
    employees: [],
    idType: "",
    address: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    companyName: "",
    email: "",
    idNumber: "",
    logoUrl: "",
    phone: "",
    settings: {
      formuapp: {},
      googleMaps: {},
      masiveEmails: {},
      purchases: {},
      quotations: {
        quotationNumber: "",
        paymentTerms: [""],
        shippingTerms: [""],
        notes: "",
        bgImage: "",
        footerText: "",
      },
      whatsapp: {},
      invoiceSettings: {
        type_document_id: 0,
        prefix: "",
        resolution: 0,
        resolution_date: "",
        technical_key: "",
        from: 0,
        to: 0,
        generated_to_date: 0,
        date_from: "",
        date_to: "",
      },
    },
    whatsapp: "",
    createdAt: "",
    updatedAt: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { resetSettings } = useSettingsStore();

  // Sincronizar el estado interno con Zustand cuando cambie
  useEffect(() => {
    setUser(zustandAuth.user);
  }, [zustandAuth.user]);
  // Modificar la función validateSession en AuthContext.tsx
  const validateSession = useCallback(async () => {
    console.log("AuthContext - validateSession start", {
      isLoading,
      hasUser: !!user,
    });

    try {
      console.log("Validando sesión...");
      setIsLoading(true);

      // Verificar el estado del store de Zustand antes de hacer petición API
      const storeState = useAuthStore.getState();
      console.log("AuthContext - Zustand state before validation", {
        isAuthenticated: storeState.isAuthenticated,
        hasUser: !!storeState.user,
        hasToken: !!storeState.token,
      });

      const res = await authService.validateSession();
      console.log("AuthContext - validateSession success", {
        hasResponseUser: !!res.user,
        hasResponseOrg: !!res.organization,
      });

      // Actualizar el estado local (AuthContext)
      setUser(res.user);
      if (res.organization) {
        setOrganization(res.organization);
      }

      return true;
    } catch (error: any) {
      console.error("Session validation error:", error);

      // Verificar si es un error de competencia (session already in progress)
      if (error.message && error.message.includes("already in progress")) {
        console.log(
          "AuthContext - Concurrent validation error, not logging out"
        );

        // No hacer nada en caso de validaciones concurrentes
        // Si hay datos de autenticación válidos, mantenerlos
        if (useAuthStore.getState().isAuthenticated) {
          console.log(
            "AuthContext - We have valid auth data, ignoring concurrent error"
          );
          return true;
        }
      }

      // Log estado actual antes de limpiar (solo para errores reales)
      console.log("AuthContext - validateSession error, current state", {
        localStorageToken: localStorage.getItem("auth_token")
          ? "exists"
          : "missing",
        localStorageUser: localStorage.getItem("auth_user")
          ? "exists"
          : "missing",
        zustandAuth: useAuthStore.getState().isAuthenticated,
        path: location.pathname,
      });

      // Solo limpiar estado y redirigir para errores reales de autenticación
      setUser(null);
      resetSettings();
      if (location.pathname !== "/login") {
        console.log(
          "AuthContext - redirecting to login after validation error"
        );
        navigate("/login", { state: { from: location.pathname } });
      }
      return false;
    } finally {
      setIsLoading(false);
      console.log("AuthContext - validateSession complete", {
        isLoading: false,
        hasUser: !!user,
      });
    }
  }, [location.pathname, navigate, resetSettings]);
  // Inicialización
  useEffect(() => {
    const initializeAuth = async () => {
      const isValid = await validateSession();

      if (isValid) {
        setupTokenRefresh();
      }
    };

    initializeAuth();
    setupStorageSync();

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [validateSession]);

  const setupTokenRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Verificar token cada 12 horas
    const REFRESH_INTERVAL = 12 * 60 * 60 * 1000;
    const interval = setInterval(async () => {
      try {
        if (user) {
          console.log("Verificando token...");
          await authService.validateSession();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        await logout();
      }
    }, REFRESH_INTERVAL);

    setRefreshInterval(interval);
    return () => clearInterval(interval);
  };

  const setupStorageSync = () => {
    // Sincronización entre pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_user") {
        const newUserStr = e.newValue;
        const newUser = newUserStr ? JSON.parse(newUserStr) : null;

        if (JSON.stringify(user) !== newUserStr) {
          setUser(newUser);
          if (!newUser) {
            resetSettings();
            navigate("/login");
          }
        }
      }
    };

    // Manejo del evento de logout global
    const handleLogout = () => {
      setUser(null);
      resetSettings();
      navigate("/login");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:logout", handleLogout);
    };
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      // Los cambios en user y token ya deberían estar hechos por AuthService
      // sólo actualizamos el organization en el contexto
      setUser(response.user);
      if (response.organization) {
        setOrganization(response.organization);
      }

      setupTokenRefresh();

      const from = location.state?.from || "/";
      navigate(from);
    } catch (error) {
      toast.show({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        type: "error",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();

      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }

      setUser(null);
      resetSettings();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      resetSettings();
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        organization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}