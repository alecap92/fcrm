// Configuración específica para integración con OpenAI

export const OPENAI_CONFIG = {
  // Modelos disponibles
  MODELS: {
    GPT_4O_MINI: "gpt-4o-mini",
    GPT_4: "gpt-4",
    GPT_3_5_TURBO: "gpt-3.5-turbo",
  },

  // Configuración por defecto
  DEFAULT_MODEL: "gpt-4o-mini",
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 500,

  // Límites de tokens para control de costos
  TOKEN_LIMITS: {
    WARNING_THRESHOLD: 1000, // Advertir al usuario
    MAX_TOKENS: 2000, // Máximo permitido
  },

  // Prompts del sistema por módulo
  SYSTEM_PROMPTS: {
    base: `Eres un asistente experto en CRM y análisis de datos para FusionCRM. 
    Ayudas a los usuarios con análisis de datos, insights de negocio, y recomendaciones estratégicas.
    Responde de manera concisa y práctica, enfocándote en acciones específicas.
    Siempre responde en español con un tono profesional pero amigable.`,

    contacts: `Especialízate en gestión de contactos y relaciones con clientes. 
    Proporciona insights sobre lead scoring, segmentación, y estrategias de conversión.`,

    deals: `Enfócate en análisis de oportunidades de venta, pipeline management, 
    y estrategias para cerrar más deals. Analiza patrones de conversión y recomienda acciones.`,

    analytics: `Eres experto en interpretación de datos y métricas de CRM. 
    Ayuda a identificar tendencias, KPIs importantes, y oportunidades de mejora.`,
  },

  // Palabras clave que NO requieren GPT (respuestas locales)
  LOCAL_KEYWORDS: [
    "valor promedio",
    "total",
    "suma",
    "cantidad",
    "contar",
    "estadística básica",
    "promedio",
    "máximo",
    "mínimo",
  ],

  // Configuración de retry para errores
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000, // ms
    backoffMultiplier: 2,
  },

  // Mensajes de error personalizados
  ERROR_MESSAGES: {
    API_ERROR:
      "No pude conectar con GPT en este momento. Intenta de nuevo más tarde.",
    RATE_LIMIT:
      "Has alcanzado el límite de consultas. Espera un momento antes de intentar de nuevo.",
    TOKEN_LIMIT: "Tu consulta es muy larga. Intenta ser más específico.",
    NO_API_KEY:
      "No se encontró configuración de OpenAI. Contacta al administrador.",
    NETWORK_ERROR:
      "Error de conexión. Verifica tu internet e intenta de nuevo.",
  },
};

export default OPENAI_CONFIG;
