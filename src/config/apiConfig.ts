import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

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

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
      headers: {
        "Content-Type": "application/json",
      },
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
      (config) => {
        // Get token from storage
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config;

        if (!config || !config.retry) {
          config!.retry = 0;
        }

        if (config!.retry >= this.retryCount) {
          return Promise.reject(this.handleError(error));
        }

        config!.retry += 1;
        const delay = new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * config!.retry)
        );
        await delay;

        return this.api(config!);
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

  public async get<T>(url: string, params?: object): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async post<T>(url: string, data: object): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async put<T>(url: string, data: object): Promise<T> {
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
}

export const apiService = ApiService.getInstance();
