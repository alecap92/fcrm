// utils/syncAuth.ts
import { useAuthStore } from "../store/authStore";

export function syncAuthOnStartup() {
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("auth_user");

  // Verificar si hay token y usuario en localStorage
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);

      // Verificar el estado actual de Zustand
      const currentState = useAuthStore.getState();

      // Actualizar Zustand solo si es necesario
      if (!currentState.isAuthenticated || !currentState.token) {
        console.log("Sincronizando estado de autenticación desde localStorage");
        useAuthStore.setState({
          user,
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error sincronizando autenticación:", error);
    }
  }
}
