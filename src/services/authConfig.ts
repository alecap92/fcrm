import { AxiosError } from "axios";
import { apiService } from "../config/apiConfig";
import { useAuthStore } from "../store/authStore"; // Importar Zustand store
import type { LoginCredentials, AuthResponse, User } from "../types/auth";

class AuthService {
  private static instance: AuthService;
  private tokenKey = "auth_token";
  private userKey = "auth_user";
  private tokenExpiryKey = "auth_token_expiry";
  private organizationKey = "auth_organization"; // New key for organization data
  private sessionValidationInProgress = false;

  private constructor() {
    // Sincronizar localStorage con Zustand al inicio
    this.syncFromLocalStorageToZustand();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Método para sincronizar localStorage -> Zustand
  private syncFromLocalStorageToZustand(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Actualizar Zustand con los datos de localStorage
        useAuthStore.setState({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        "/auth/login",
        credentials
      );

      this.setSession(response);
      return response;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  public async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        "/auth/register",
        userData
      );

      this.setSession(response);
      return response;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  public async logout(): Promise<void> {
    try {
      console.log("Logging out...");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearSession();

      // Actualizar Zustand al cerrar sesión
      useAuthStore.getState().logout();

      // Disparar evento para sincronizar otras pestañas
      window.dispatchEvent(new Event("auth:logout"));
    }
  }

  public async validateSession(): Promise<any> {
    if (this.sessionValidationInProgress) {
      // Verificar si hay datos de autenticación válidos
      const zustandState = useAuthStore.getState();

      // Si ya tenemos datos válidos, devolver una respuesta "simulada" en vez de error
      if (
        zustandState.isAuthenticated &&
        zustandState.user &&
        zustandState.token
      ) {
        // Also include organization data if available
        const orgStr = localStorage.getItem(this.organizationKey);
        const organization = orgStr ? JSON.parse(orgStr) : null;

        return {
          user: zustandState.user,
          token: zustandState.token,
          organization: organization,
        };
      }

      return Promise.reject(
        new Error("Session validation already in progress")
      );
    }

    this.sessionValidationInProgress = true;

    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("No token available");
      }

      const tokenExpiry = this.getTokenExpiry();
      const now = new Date().getTime();
      if (tokenExpiry && now > tokenExpiry) {
        console.log("Token has expired locally, attempting refresh");
        return await this.refreshToken();
      }

      const response = await apiService.post<AuthResponse>(
        "/auth/verify-token",
        {}
      );

      if (
        response &&
        typeof response === "object" &&
        "user" in response &&
        response.user
      ) {
        // Actualizar localStorage
        localStorage.setItem(this.userKey, JSON.stringify(response.user));

        // Store organization data separately
        if (response.organization) {
          localStorage.setItem(
            this.organizationKey,
            JSON.stringify(response.organization)
          );
        }

        // Actualizar Zustand si el usuario ha cambiado
        const currentZustandState = useAuthStore.getState();
        if (
          JSON.stringify(currentZustandState.user) !==
          JSON.stringify(response.user)
        ) {
          useAuthStore.setState({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          });
        }
      }

      return response;
    } catch (error) {
      console.error("AuthService - Session validation error:", error);

      try {
        return await this.refreshToken();
      } catch (refreshError) {
        this.clearSession();
        throw this.handleAuthError(refreshError as AxiosError);
      }
    } finally {
      this.sessionValidationInProgress = false;
    }
  }

  public async refreshToken(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("No token available for refresh");
      }

      const response = await apiService.post<AuthResponse>("/auth/refresh", {});

      if (
        response &&
        typeof response === "object" &&
        "token" in response &&
        response.token
      ) {
        this.setSession(response as AuthResponse);
      }

      return response;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearSession();

      // Actualizar Zustand al fallar la renovación
      useAuthStore.getState().logout();

      throw this.handleAuthError(error as AxiosError);
    }
  }

  public getToken(): string | null {
    // Obtener token de localStorage (fuente principal)
    const token = localStorage.getItem(this.tokenKey);

    // Si existe, verificar que Zustand esté sincronizado
    if (token && !useAuthStore.getState().token) {
      this.syncFromLocalStorageToZustand();
    }

    return token;
  }

  public getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    const user = userStr ? JSON.parse(userStr) : null;

    // Si existe usuario en localStorage pero no en Zustand, sincronizar
    if (user && !useAuthStore.getState().user) {
      this.syncFromLocalStorageToZustand();
    }

    return user;
  }

  private getTokenExpiry(): number | null {
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    return expiry ? parseInt(expiry, 10) : null;
  }

  private setSession(response: AuthResponse): void {
    console.log("🔐 AuthService.setSession - Almacenando sesión:", {
      hasToken: !!response.token,
      hasUser: !!response.user,
      hasOrganization: !!response.organization,
    });

    // Guardar en localStorage PRIMERO
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);

      // Decodificar el token para obtener la información de expiración
      try {
        const tokenPayload = JSON.parse(atob(response.token.split(".")[1]));
        const rememberMe = tokenPayload.rememberMe || false;

        // Calcular expiración basada en rememberMe
        // Si rememberMe es true: 30 días, si es false: 24 horas
        const expiresIn = rememberMe
          ? 30 * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;
        const expiryTime = new Date().getTime() + expiresIn;

        localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());

        console.log(
          `✅ Token almacenado con expiración de ${
            rememberMe ? "30 días" : "24 horas"
          }`
        );
      } catch (error) {
        console.error("Error decodificando token:", error);
        // Fallback: usar 24 horas por defecto
        const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
      }

      console.log("✅ Token almacenado en localStorage");
    }

    if (response.user) {
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
      console.log("✅ Usuario almacenado en localStorage");
    }

    // Store organization data separately
    if (response.organization) {
      localStorage.setItem(
        this.organizationKey,
        JSON.stringify(response.organization)
      );
      console.log("✅ Organización almacenada en localStorage");
    }

    // Actualizar Zustand DESPUÉS de localStorage
    useAuthStore.setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
    });

    console.log("✅ Estado de Zustand actualizado");

    // Verificar que todo se almacenó correctamente
    const storedToken = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);
    const zustandState = useAuthStore.getState();

    console.log("🔍 Verificación post-almacenamiento:", {
      localStorageToken: !!storedToken,
      localStorageUser: !!storedUser,
      zustandToken: !!zustandState.token,
      zustandUser: !!zustandState.user,
      zustandAuthenticated: zustandState.isAuthenticated,
    });

    // Notificar a otras pestañas
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.userKey,
        newValue: localStorage.getItem(this.userKey),
      })
    );
  }

  private clearSession(): void {
    // Limpiar localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem(this.organizationKey);

    // Limpiar Zustand
    // (esto se hace ahora en el método logout mediante useAuthStore.getState().logout())
  }

  private handleAuthError(error: AxiosError): Error {
    if (error.response?.status === 401) {
      this.clearSession();

      // Actualizar Zustand
      useAuthStore.getState().logout();

      // Disparar evento para sincronizar otras pestañas
      window.dispatchEvent(new Event("auth:logout"));
      return new Error("Authentication failed");
    }
    return new Error(
      error.message || "An error occurred during authentication"
    );
  }
}

export const authService = AuthService.getInstance();
