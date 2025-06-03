import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { authService } from "./authConfig";

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  private retryCount = 3;
  private retryDelay = 1000;
  private isValidatingSession = false;

  private constructor() {
    this.api = axios.create({
      baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "https://fusioncrmapiv3-production.up.railway.app/api/v1",
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Log para debugging
    console.log("🔧 API Config:", {
      baseURL: this.api.defaults.baseURL,
      env: import.meta.env.MODE,
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Get token from auth service instead of directly from localStorage
        const token = authService.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with auth handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalConfig = error.config as any;

        // Evitar bucles infinitos en endpoints de autenticación
        const isAuthEndpoint = originalConfig?.url?.includes("/auth/");

        // Special handling for 401 Unauthorized errors
        if (
          error.response?.status === 401 &&
          !originalConfig?._retry &&
          !isAuthEndpoint
        ) {
          // Only attempt to refresh session once
          originalConfig._retry = true;

          // Avoid multiple simultaneous validation attempts
          if (!this.isValidatingSession) {
            this.isValidatingSession = true;

            try {
              // Attempt to validate the session with the server
              await authService.validateSession();

              // Get the fresh token
              const newToken = authService.getToken();
              if (!newToken) {
                throw new Error("Failed to get new token");
              }

              // Update the header and retry the request
              originalConfig.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalConfig);
            } catch (refreshError) {
              console.error(
                "❌ Session validation failed after 401:",
                refreshError
              );
              // Notify all tabs about the logout
              window.dispatchEvent(new Event("auth:logout"));
              return Promise.reject(this.handleError(error));
            } finally {
              this.isValidatingSession = false;
            }
          } else {
            // If we're already validating the session, just reject
            return Promise.reject(this.handleError(error));
          }
        }

        // Para endpoints de autenticación que fallan, no reintentar
        if (isAuthEndpoint && error.response?.status === 401) {
          // Notify all tabs about the logout
          window.dispatchEvent(new Event("auth:logout"));
          return Promise.reject(this.handleError(error));
        }

        // Handle retries for network errors or 5xx server errors
        if (
          (error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT" ||
            (error.response?.status && error.response.status >= 500)) &&
          !originalConfig?._retry
        ) {
          originalConfig._retry = 0;
        }

        if (
          originalConfig?._retry !== undefined &&
          typeof originalConfig._retry === "number" &&
          originalConfig._retry < this.retryCount
        ) {
          originalConfig._retry++;
          const delay = new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * originalConfig._retry)
          );
          await delay;
          return this.api(originalConfig);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      return {
        message: data.message || "An error occurred",
        code: data.code,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: "No response from server",
        code: "NETWORK_ERROR",
      };
    } else {
      // Request setup error
      return {
        message: error.message || "Request failed",
        code: "REQUEST_ERROR",
      };
    }
  }

  public async get<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.api.get<T>(url, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async post<T>(url: string, data: object = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async put<T>(url: string, data: object = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async delete<T>(url: string, body?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, {
        data: body, // El body debe ir dentro de un objeto config con la propiedad 'data'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async patch<T>(url: string, data: object = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

export const apiService = ApiService.getInstance();
