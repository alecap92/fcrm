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
// Usar popup en desarrollo, redirect en producción
const isDevelopment = import.meta.env.DEV;

export const signInWithGoogle = () => {
  if (isDevelopment) {
    // En desarrollo, usar popup pero con mejor manejo de errores
    return signInWithPopup(auth, googleProvider).catch((error) => {
      console.error("Error en Google Sign-In:", error);
      // Si falla el popup, intentar con redirect
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        console.log("Popup bloqueado, intentando con redirect...");
        return signInWithRedirect(auth, googleProvider);
      }
      throw error;
    });
  } else {
    // En producción, usar redirect
    return signInWithRedirect(auth, googleProvider);
  }
};

export const signInWithFacebook = () => {
  if (isDevelopment) {
    return signInWithPopup(auth, facebookProvider).catch((error) => {
      console.error("Error en Facebook Sign-In:", error);
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        console.log("Popup bloqueado, intentando con redirect...");
        return signInWithRedirect(auth, facebookProvider);
      }
      throw error;
    });
  } else {
    return signInWithRedirect(auth, facebookProvider);
  }
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
