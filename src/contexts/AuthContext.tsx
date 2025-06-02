import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authConfig";
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
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
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
    employees: [{ _id: "2" }] as any,
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
    iconUrl: "",
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

  // Sincronizar con Zustand store
  useEffect(() => {
    setUser(zustandAuth.user);
  }, [zustandAuth.user]);

  // Modificar la función validateSession en AuthContext.tsx
  const validateSession = useCallback(async () => {
    try {
      setIsLoading(true);

      // Verificar si ya tenemos un usuario autenticado en Zustand
      const zustandState = useAuthStore.getState();
      if (
        zustandState.isAuthenticated &&
        zustandState.user &&
        zustandState.token
      ) {
        setUser(zustandState.user);

        // Obtener organización del localStorage si existe
        const orgStr = localStorage.getItem("auth_organization");
        if (orgStr) {
          try {
            const org = JSON.parse(orgStr);
            setOrganization({
              ...org,
              employees: org.employees || [],
              iconUrl: org.iconUrl || "",
            });
          } catch (e) {
            console.error("Error parsing organization:", e);
          }
        }

        return true;
      }

      const res = await authService.validateSession();

      // Actualizar el estado local (AuthContext)
      setUser(res.user);
      if (res.organization) {
        setOrganization({
          ...res.organization,
          employees: res.organization.employees || [],
          iconUrl: res.organization.iconUrl || "",
        });
      }

      return true;
    } catch (error: any) {
      console.error("Session validation error:", error);

      // Verificar si es un error de competencia (session already in progress)
      if (error.message && error.message.includes("already in progress")) {
        // No hacer nada en caso de validaciones concurrentes
        // Si hay datos de autenticación válidos, mantenerlos
        if (useAuthStore.getState().isAuthenticated) {
          return true;
        }
      }

      // Solo limpiar estado y redirigir para errores reales de autenticación
      setUser(null);
      resetSettings();

      // No redirigir si estamos en rutas públicas
      const publicRoutes = ["/login", "/register"];
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/login", { state: { from: location.pathname } });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [location.pathname, navigate, resetSettings]);

  // Inicialización - SOLO se ejecuta una vez al montar el componente
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // No validar sesión en rutas públicas
      const publicRoutes = ["/login", "/register"];
      if (publicRoutes.includes(location.pathname)) {
        // En rutas públicas, solo verificar si ya hay autenticación válida
        const zustandState = useAuthStore.getState();
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("auth_user");

        if (
          zustandState.isAuthenticated &&
          zustandState.user &&
          zustandState.token
        ) {
          setUser(zustandState.user);

          // Obtener organización del localStorage si existe
          const orgStr = localStorage.getItem("auth_organization");
          if (orgStr) {
            try {
              const org = JSON.parse(orgStr);
              setOrganization({
                ...org,
                employees: org.employees || [],
                iconUrl: org.iconUrl || "",
              });
            } catch (e) {
              console.error("Error parsing organization:", e);
            }
          }
        } else if (token && userStr) {
          // Sincronizar desde localStorage si no está en Zustand
          try {
            const user = JSON.parse(userStr);
            useAuthStore.setState({
              user,
              token,
              isAuthenticated: true,
            });
            setUser(user);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }

        setIsLoading(false);
        return;
      }

      // Verificar primero si ya tenemos datos de autenticación válidos
      const zustandState = useAuthStore.getState();
      if (
        zustandState.isAuthenticated &&
        zustandState.user &&
        zustandState.token
      ) {
        setUser(zustandState.user);
        setIsLoading(false);

        // Obtener organización del localStorage si existe
        const orgStr = localStorage.getItem("auth_organization");
        if (orgStr) {
          try {
            const org = JSON.parse(orgStr);
            setOrganization({
              ...org,
              employees: org.employees || [],
              iconUrl: org.iconUrl || "",
            });
          } catch (e) {
            console.error("Error parsing organization:", e);
          }
        }

        setupTokenRefresh();
        return;
      }

      // Solo validar sesión si no tenemos datos válidos
      if (isMounted) {
        const isValid = await validateSession();
        if (isValid && isMounted) {
          setupTokenRefresh();
        }
      }
    };

    initializeAuth();
    setupStorageSync();

    return () => {
      isMounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []); // Dependencias vacías - solo se ejecuta al montar

  const setupTokenRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Verificar token cada 12 horas
    const REFRESH_INTERVAL = 12 * 60 * 60 * 1000;
    const interval = setInterval(async () => {
      try {
        if (user) {
          await authService.validateSession();
        }
      } catch (error) {
        await logout();
      }
    }, REFRESH_INTERVAL);

    setRefreshInterval(interval as any);
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

      setUser(response.user);
      if (response.organization) {
        setOrganization({
          ...response.organization,
          employees: response.organization.employees || [],
          iconUrl: response.organization.iconUrl || "",
        });
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

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      setUser(response.user);
      if (response.organization) {
        setOrganization({
          ...response.organization,
          employees: response.organization.employees || [],
          iconUrl: response.organization.iconUrl || "",
        });
      }

      setupTokenRefresh();

      const from = location.state?.from || "/";
      navigate(from);
    } catch (error) {
      toast.show({
        title: "Error",
        description: error instanceof Error ? error.message : "Register failed",
        type: "error",
      });
      throw error;
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
        register,
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
