import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../config/authConfig";
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
  const [user, setUser] = useState<any | null>(authService.getUser());
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
      quotations: {},
      whatsapp: {},
      invoiceConfig: {
        resolution: 0,
        from: 0,
        to: 0,
        prefix: "",
        type_document_id: 9,
        resolution_date: "",
        technical_key: "",
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
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { resetSettings } = useSettingsStore();

  useEffect(() => {
    validateSession();
    setupTokenRefresh();
    setupStorageSync();
  }, []);

  const validateSession = async () => {
    try {
      console.log("validando sesion");
      setIsLoading(true);
      const res = await authService.validateSession();

      setUser(res.user);
      setOrganization(res.organization);
    } catch (error) {
      setUser(null);
      resetSettings();
      if (location.pathname !== "/login") {
        navigate("/login", { state: { from: location.pathname } });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setupTokenRefresh = () => {
    const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes
    const interval = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (error) {
        console.error("Token refresh failed:", error);
        await logout();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  };

  const setupStorageSync = () => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_user") {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(newUser);
        if (!newUser) {
          resetSettings();
          navigate("/login");
        }
      }
    };

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
      const response = await authService.login(credentials);

      setUser(response.user);
      setOrganization(response.organization);

      const from = location.state?.from || "/";
      navigate(from);
    } catch (error) {
      toast.show({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        type: "error",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      resetSettings();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear the session and redirect even if the API call fails
      setUser(null);
      resetSettings();
      navigate("/login", { replace: true });
    }
  };

  if (isLoading) {
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
