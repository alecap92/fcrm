// ===== TABS DE NAVEGACIÓN =====
export const AUTOMATION_TABS = [
  { id: "sequences", label: "Secuencias", href: "/automations/sequences" },
  { id: "automations", label: "Mis Automatizaciones", href: "/automations" },
  { id: "templates", label: "Plantillas", href: "/automations/templates" },
];

// ===== ETIQUETAS DE TIPOS DE DISPARADORES =====
export const TRIGGER_TYPE_LABELS: Record<string, string> = {
  message_received: "Mensaje recibido",
  conversation_started: "Conversación iniciada",
  keyword: "Palabra clave",
  scheduled: "Programado",
  webhook: "Webhook",
  email: "Email",
  manual: "Manual",
};

// ===== ESTADOS DE AUTOMATIZACIÓN =====
export const AUTOMATION_STATUSES = {
  ACTIVE: "active" as const,
  INACTIVE: "inactive" as const,
};

// ===== OPCIONES DE FILTROS =====
export const FILTER_OPTIONS = {
  TRIGGER_TYPES: [
    { value: "", label: "Todos los disparadores" },
    { value: "message_received", label: "Mensaje recibido" },
    { value: "conversation_started", label: "Conversación iniciada" },
    { value: "keyword", label: "Palabra clave" },
    { value: "scheduled", label: "Programado" },
    { value: "webhook", label: "Webhook" },
    { value: "email", label: "Email" },
  ],
  STATUSES: [
    { value: "", label: "Todos los estados" },
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
  ],
  DATE_RANGES: [
    { value: "", label: "Todas las fechas" },
    { value: "today", label: "Hoy" },
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mes" },
  ],
};

// ===== MENSAJES DE TEXTO =====
export const AUTOMATION_MESSAGES = {
  LOADING: "Cargando automatizaciones...",
  NO_AUTOMATIONS: "No hay automatizaciones",
  NO_AUTOMATIONS_DESCRIPTION: "Comienza creando tu primera automatización",
  NO_SEARCH_RESULTS: "No se encontraron automatizaciones",
  NO_SEARCH_RESULTS_DESCRIPTION: "Intenta con otros términos de búsqueda",
  DELETE_CONFIRMATION: "¿Estás seguro de que quieres eliminar",
  DELETE_WARNING: "Esta acción no se puede deshacer.",
  ACTIVATED: "activada",
  DEACTIVATED: "desactivada",
  EXECUTED: "ejecutada",
  DELETED: "eliminada",
};

// ===== CONFIGURACIÓN DE PAGINACIÓN =====
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};
