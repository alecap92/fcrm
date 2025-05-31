import { AxiosError } from "axios";
import { apiService } from "./apiConfig";
import { useAuthStore } from "../store/authStore"; // Importar Zustand store
import type { LoginCredentials, AuthResponse, User } from "../types/auth";

class AuthService {
  private static instance: AuthService;
  private tokenKey = "auth_token";
  private userKey = "auth_user";
  private tokenExpiryKey = "auth_token_expiry";
  private sessionValidationInProgress = false;
  private refreshTokenInProgress = false;
  private maxRetries = 1; // Máximo número de reintentos para evitar bucles

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
        return {
          user: zustandState.user,
          token: zustandState.token,
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
        console.log("Token expired locally, attempting refresh");
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

        // Actualizar Zustand si el usuario ha cambiado
        const currentUser = useAuthStore.getState().user;
        if (JSON.stringify(currentUser) !== JSON.stringify(response.user)) {
          useAuthStore.setState({ user: response.user });
        }
      }

      return response;
    } catch (error) {
      console.error("AuthService - Session validation error:", error);

      // Solo intentar refresh si no estamos ya en un proceso de refresh
      if (!this.refreshTokenInProgress) {
        try {
          return await this.refreshToken();
        } catch (refreshError) {
          console.error("AuthService - Refresh also failed:", refreshError);
          this.clearSession();
          throw this.handleAuthError(refreshError as AxiosError);
        }
      } else {
        // Si ya estamos refrescando, fallar inmediatamente
        this.clearSession();
        throw this.handleAuthError(error as AxiosError);
      }
    } finally {
      this.sessionValidationInProgress = false;
    }
  }

  public async refreshToken(): Promise<any> {
    // Evitar múltiples llamadas simultáneas de refresh
    if (this.refreshTokenInProgress) {
      throw new Error("Token refresh already in progress");
    }

    this.refreshTokenInProgress = true;

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
    } finally {
      this.refreshTokenInProgress = false;
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
    // Guardar en localStorage
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);

      const expiresIn = 29 * 24 * 60 * 60 * 1000; // 29 días
      const expiryTime = new Date().getTime() + expiresIn;
      localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    }

    if (response.user) {
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
    }

    // Actualizar Zustand
    useAuthStore.setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
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
