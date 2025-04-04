import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

// Crear un storage personalizado que se sincronice con localStorage
const customStorage = {
  getItem: (name: string) => {
    // Primero intentar obtener de localStorage directamente para garantizar datos frescos
    const tokenFromLS = localStorage.getItem("auth_token");
    const userFromLS = localStorage.getItem("auth_user");

    if (tokenFromLS && userFromLS) {
      try {
        const user = JSON.parse(userFromLS);
        return JSON.stringify({
          state: {
            user,
            token: tokenFromLS,
            isAuthenticated: true,
          },
          version: 0,
        });
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }

    // Si no está en localStorage o hay error, usar el almacenamiento normal
    const stateStr = sessionStorage.getItem(name);
    if (!stateStr) return null;
    return stateStr;
  },
  setItem: (name: string, value: string) => {
    // Al actualizar el store, también actualizamos localStorage
    try {
      const parsed = JSON.parse(value);
      const { user, token, isAuthenticated } = parsed.state;

      if (isAuthenticated && user && token) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
      } else {
        // Si se hace logout, limpiamos localStorage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token_expiry");
      }
    } catch (e) {
      console.error("Error updating localStorage from Zustand", e);
    }

    sessionStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    // Limpiar tanto sessionStorage como localStorage
    sessionStorage.removeItem(name);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token_expiry");
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => customStorage),
    }
  )
);

// Función auxiliar para sincronizar manualmente cuando sea necesario
export function syncAuthStorage() {
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("auth_user");

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.setState({
        user,
        token,
        isAuthenticated: true,
      });
      return true;
    } catch (e) {
      console.error("Error syncing auth storage", e);
      return false;
    }
  }
  return false;
}
