import { formatDistanceToNow } from "date-fns";

export function timeAgo(date?: string | Date | null) {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

/**
 * Formatea una fecha para mostrar "Hoy", "Ayer" o la fecha completa
 */
export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Hoy";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  } else {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};

/**
 * Formatea una hora en formato 12 horas con AM/PM
 */
export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formatea una fecha completa con hora
 */
export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Obtiene la diferencia en horas entre dos fechas
 */
export const getHoursDifference = (
  timestamp1: string,
  timestamp2: string
): number => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
};

/**
 * Verifica si una fecha es de hoy
 */
export const isToday = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Verifica si una fecha es de ayer
 */
export const isYesterday = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};
