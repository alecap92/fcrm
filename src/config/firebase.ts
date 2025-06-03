import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIq40qJa1oh3u3hp_DXkiZzpAaQfSIMNc",
  authDomain: "fusioncrm-86214.firebaseapp.com",
  projectId: "fusioncrm-86214",
  storageBucket: "fusioncrm-86214.firebasestorage.app",
  messagingSenderId: "302870135222",
  appId: "1:302870135222:web:ccefdc461c48ecc243c117",
  measurementId: "G-NVKTJ6RVJH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Verificar configuración en desarrollo
if (import.meta.env.DEV) {
  console.log("🔧 Firebase Config:", {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    currentOrigin: window.location.origin,
  });
}

// Initialize Analytics (opcional, solo en producción)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Auth
export const auth = getAuth(app);

// Configurar proveedores
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
// Configuración adicional para evitar errores
googleProvider.setCustomParameters({
  prompt: "select_account",
});

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");

// Funciones de autenticación con mejor manejo de errores
// Usar popup preferentemente, con fallback a redirect
const isDevelopment = import.meta.env.DEV;

export const signInWithGoogle = () => {
  // Intentar popup primero (más confiable y mejor UX)
  return signInWithPopup(auth, googleProvider).catch((error) => {
    console.error("Error en Google Sign-In popup:", error);

    // Si falla el popup por bloqueo o cierre, usar redirect como fallback
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      console.log(
        "Popup bloqueado o cerrado, usando redirect como fallback..."
      );
      return signInWithRedirect(auth, googleProvider);
    }

    // Para otros errores, re-lanzar
    throw error;
  });
};

export const signInWithFacebook = () => {
  // Mismo enfoque para Facebook
  return signInWithPopup(auth, facebookProvider).catch((error) => {
    console.error("Error en Facebook Sign-In popup:", error);

    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      console.log(
        "Popup bloqueado o cerrado, usando redirect como fallback..."
      );
      return signInWithRedirect(auth, facebookProvider);
    }

    throw error;
  });
};

// Función para manejar el resultado del redirect
export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export { GoogleAuthProvider, FacebookAuthProvider };
export { analytics };
