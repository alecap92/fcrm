import { useCallback, useRef } from "react";

interface UseNotificationSoundOptions {
  soundUrl?: string;
  volume?: number;
  enabled?: boolean;
}

export const useNotificationSound = (
  options: UseNotificationSoundOptions = {}
) => {
  const {
    soundUrl = "/sounds/notification.mp3", // Sonido por defecto
    volume = 0.5,
    enabled = true,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Función para generar un sonido de notificación programáticamente
  const generateNotificationSound = useCallback(() => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar el tono (frecuencia más agradable para notificaciones)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    // Configurar el volumen con fade in/out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume * 0.3,
      audioContext.currentTime + 0.05
    );
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

    // Reproducir el sonido
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    return new Promise<void>((resolve) => {
      oscillator.onended = () => {
        audioContext.close();
        resolve();
      };
    });
  }, [volume]);

  // Función para inicializar el audio
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = volume;
      audioRef.current.preload = "auto";
    }
  }, [soundUrl, volume]);

  // Función para reproducir el sonido de notificación
  const playNotificationSound = useCallback(async () => {
    if (!enabled) return;

    try {
      // Intentar reproducir el archivo de audio primero
      initializeAudio();

      if (audioRef.current) {
        // Reiniciar el audio al principio por si ya se estaba reproduciendo
        audioRef.current.currentTime = 0;

        // Intentar reproducir el sonido
        await audioRef.current.play();
        console.log(
          "[NotificationSound] Sonido de notificación reproducido desde archivo"
        );
      }
    } catch (error) {
      console.warn(
        "[NotificationSound] No se pudo reproducir el archivo de audio, usando sonido generado:",
        error
      );

      // Si falla el archivo, usar sonido generado programáticamente
      try {
        await generateNotificationSound();
        console.log(
          "[NotificationSound] Sonido de notificación generado reproducido"
        );
      } catch (generatedError) {
        console.warn(
          "[NotificationSound] No se pudo reproducir ningún sonido:",
          generatedError
        );
      }
    }
  }, [enabled, initializeAudio, generateNotificationSound]);

  // Función para reproducir un sonido personalizado
  const playCustomSound = useCallback(
    async (customSoundUrl: string) => {
      if (!enabled) return;

      try {
        const customAudio = new Audio(customSoundUrl);
        customAudio.volume = volume;
        await customAudio.play();
        console.log(
          "[NotificationSound] Sonido personalizado reproducido:",
          customSoundUrl
        );
      } catch (error) {
        console.warn(
          "[NotificationSound] No se pudo reproducir el sonido personalizado:",
          error
        );
      }
    },
    [enabled, volume]
  );

  // Función para probar el sonido
  const testSound = useCallback(() => {
    playNotificationSound();
  }, [playNotificationSound]);

  return {
    playNotificationSound,
    playCustomSound,
    testSound,
  };
};
