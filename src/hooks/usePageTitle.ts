import { useEffect, useRef, useCallback } from "react";
import { useNotificationSound } from "./useNotificationSound";

interface UsePageTitleOptions {
  defaultTitle?: string;
  blinkInterval?: number;
  blinkDuration?: number;
  soundEnabled?: boolean;
  soundUrl?: string;
  soundVolume?: number;
}

export const usePageTitle = (options: UsePageTitleOptions = {}) => {
  const {
    defaultTitle = "FusionCRM",
    blinkInterval = 2000,
    blinkDuration = 10000,
    soundEnabled = true,
    soundUrl,
    soundVolume = 0.5,
  } = options;

  const originalTitle = useRef(defaultTitle);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopBlinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isBlinkingRef = useRef(false);

  // Hook para manejar sonidos de notificación
  const { playNotificationSound, playCustomSound, testSound } =
    useNotificationSound({
      soundUrl,
      volume: soundVolume,
      enabled: soundEnabled,
    });

  // Función para limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = null;
    }
    if (stopBlinkTimeoutRef.current) {
      clearTimeout(stopBlinkTimeoutRef.current);
      stopBlinkTimeoutRef.current = null;
    }
  }, []);

  // Función para restaurar el título original
  const restoreTitle = useCallback(() => {
    clearTimeouts();
    isBlinkingRef.current = false;
    document.title = originalTitle.current;
  }, [clearTimeouts]);

  // Función para hacer parpadear el título
  const startBlinking = useCallback(
    (notificationTitle: string) => {
      if (isBlinkingRef.current) {
        clearTimeouts();
      }

      isBlinkingRef.current = true;
      let showNotification = true;

      const blink = () => {
        if (!isBlinkingRef.current) return;

        document.title = showNotification
          ? notificationTitle
          : originalTitle.current;
        showNotification = !showNotification;

        blinkTimeoutRef.current = setTimeout(blink, blinkInterval);
      };

      // Iniciar el parpadeo
      blink();

      // Detener el parpadeo después de la duración especificada
      stopBlinkTimeoutRef.current = setTimeout(() => {
        restoreTitle();
      }, blinkDuration);
    },
    [blinkInterval, blinkDuration, restoreTitle]
  );

  // Función para mostrar notificación de mensaje nuevo
  const showNewMessageNotification = useCallback(
    (senderName: string) => {
      const notificationTitle = `💬 ${senderName} envió un nuevo mensaje`;
      startBlinking(notificationTitle);

      // Reproducir sonido de notificación
      if (soundEnabled) {
        playNotificationSound();
      }
    },
    [startBlinking, soundEnabled, playNotificationSound]
  );

  // Función para establecer un título personalizado
  const setTitle = useCallback(
    (title: string) => {
      clearTimeouts();
      isBlinkingRef.current = false;
      document.title = title;
    },
    [clearTimeouts]
  );

  // Función para actualizar el título por defecto
  const setDefaultTitle = useCallback((title: string) => {
    originalTitle.current = title;
    if (!isBlinkingRef.current) {
      document.title = title;
    }
  }, []);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      clearTimeouts();
      document.title = originalTitle.current;
    };
  }, [clearTimeouts]);

  // Detectar cuando la ventana obtiene el foco para restaurar el título
  useEffect(() => {
    const handleFocus = () => {
      if (isBlinkingRef.current) {
        restoreTitle();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isBlinkingRef.current) {
        restoreTitle();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [restoreTitle]);

  return {
    showNewMessageNotification,
    restoreTitle,
    setTitle,
    setDefaultTitle,
    isBlinking: isBlinkingRef.current,
    // Funciones de sonido para pruebas y uso personalizado
    playNotificationSound,
    playCustomSound,
    testSound,
  };
};
