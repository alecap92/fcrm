import { AxiosError } from "axios";
import { apiService } from "./apiConfig";
import type { LoginCredentials, AuthResponse, User } from "../types/auth";

class AuthService {
  private static instance: AuthService;
  private tokenKey = "auth_token";
  private refreshTokenKey = "refresh_token";
  private userKey = "auth_user";

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
      await apiService.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearSession();
    }
  }

  public async refreshToken(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await apiService.post<AuthResponse>("/auth/refresh", {
        refreshToken,
      });

      this.setSession(response);
    } catch (error) {
      this.clearSession();
      throw this.handleAuthError(error as AxiosError);
    }
  }

  public async validateSession(): Promise<any> {
    try {
      const response = await apiService.post<User>("/auth/verify-token");

      return response;
    } catch (error) {
      this.clearSession();
      throw this.handleAuthError(error as AxiosError);
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    if (response.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    }
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  private handleAuthError(error: AxiosError): Error {
    if (error.response?.status === 401) {
      this.clearSession();
      return new Error("Authentication failed");
    }
    return new Error(
      error.message || "An error occurred during authentication"
    );
  }
}

export const authService = AuthService.getInstance();
