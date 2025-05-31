// Utilidades para debuggear problemas de autenticación
import { authService } from "../config/authConfig";
import { useAuthStore } from "../store/authStore";

export const debugAuthState = () => {
  console.group("🔍 Debug Auth State");

  // Estado de localStorage
  const token = localStorage.getItem("auth_token");
  const user = localStorage.getItem("auth_user");
  const tokenExpiry = localStorage.getItem("auth_token_expiry");

  console.log("📦 localStorage:", {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    hasUser: !!user,
    tokenExpiry: tokenExpiry ? new Date(parseInt(tokenExpiry)) : null,
    isTokenExpired: tokenExpiry ? Date.now() > parseInt(tokenExpiry) : null,
  });

  // Estado de Zustand
  const zustandState = useAuthStore.getState();
  console.log("🏪 Zustand State:", {
    isAuthenticated: zustandState.isAuthenticated,
    hasUser: !!zustandState.user,
    hasToken: !!zustandState.token,
    userEmail: zustandState.user?.email,
  });

  // Verificar si hay inconsistencias
  const hasLocalToken = !!token;
  const hasZustandToken = !!zustandState.token;
  const hasLocalUser = !!user;
  const hasZustandUser = !!zustandState.user;

  if (hasLocalToken !== hasZustandToken || hasLocalUser !== hasZustandUser) {
    console.warn("⚠️ Inconsistencia detectada entre localStorage y Zustand");
  }

  console.groupEnd();
};

export const testAuthEndpoints = async () => {
  console.group("🧪 Test Auth Endpoints");

  try {
    // Test verify-token
    console.log("Testing /auth/verify-token...");
    const verifyResult = await authService.validateSession();
    console.log("✅ verify-token success:", verifyResult);
  } catch (error) {
    console.error("❌ verify-token failed:", error);
  }

  try {
    // Test refresh
    console.log("Testing /auth/refresh...");
    const refreshResult = await authService.refreshToken();
    console.log("✅ refresh success:", refreshResult);
  } catch (error) {
    console.error("❌ refresh failed:", error);
  }

  console.groupEnd();
};

export const clearAuthState = () => {
  console.log("🧹 Clearing auth state...");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token_expiry");
  useAuthStore.getState().logout();
  console.log("✅ Auth state cleared");
};

// Función para usar en la consola del navegador
(window as any).debugAuth = {
  state: debugAuthState,
  test: testAuthEndpoints,
  clear: clearAuthState,
};
