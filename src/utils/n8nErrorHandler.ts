/**
 * Utilidad para manejar errores de N8N y proporcionar mensajes de error más específicos
 */

export interface N8nErrorResponse {
  response: {
    code: number;
    message: string;
    hint?: string;
  };
  statusCode: number;
}

export interface ErrorInfo {
  title: string;
  description: string;
}

/**
 * Procesa errores de N8N y devuelve información de error formateada
 */
export function parseN8nError(error: any, automationName?: string): ErrorInfo {
  let errorTitle = "❌ Error";
  let errorDescription = automationName
    ? `Error al ejecutar la automatización "${automationName}"`
    : "Error al procesar la solicitud";

  // Verificar si es un error de respuesta HTTP
  if (error.response?.data) {
    const errorData = error.response.data;

    // Manejo específico para errores de N8N
    if (errorData.response && errorData.statusCode) {
      const n8nError = errorData.response;

      switch (errorData.statusCode) {
        case 404:
          if (
            n8nError.message?.includes("webhook") &&
            n8nError.message?.includes("not registered")
          ) {
            errorTitle = "🔗 Webhook No Configurado";
            errorDescription = automationName
              ? `La automatización "${automationName}" no está correctamente configurada. El webhook necesita ser activado.`
              : "El webhook no está correctamente configurado y necesita ser activado.";

            if (n8nError.hint) {
              errorDescription += ` ${n8nError.hint}`;
            }
          } else {
            errorTitle = "❌ Recurso No Encontrado";
            errorDescription = automationName
              ? `La automatización "${automationName}" no fue encontrada o no está disponible.`
              : "El recurso solicitado no fue encontrado o no está disponible.";
          }
          break;

        case 400:
          errorTitle = "⚠️ Solicitud Inválida";
          errorDescription = automationName
            ? `Datos incorrectos enviados a la automatización "${automationName}": ${
                n8nError.message || "Verifique los parámetros"
              }`
            : `Solicitud inválida: ${
                n8nError.message || "Verifique los parámetros enviados"
              }`;
          break;

        case 401:
          errorTitle = "🔐 Sin Autorización";
          errorDescription = automationName
            ? `No tienes permisos para ejecutar la automatización "${automationName}". Contacta al administrador.`
            : "No tienes permisos para realizar esta acción. Contacta al administrador.";
          break;

        case 403:
          errorTitle = "🚫 Acceso Denegado";
          errorDescription = automationName
            ? `Acceso denegado para ejecutar la automatización "${automationName}". Verifica tus permisos.`
            : "Acceso denegado. Verifica tus permisos para realizar esta acción.";
          break;

        case 422:
          errorTitle = "📝 Datos No Válidos";
          errorDescription = automationName
            ? `Los datos enviados a la automatización "${automationName}" no son válidos: ${
                n8nError.message || "Revisa la información proporcionada"
              }`
            : `Los datos enviados no son válidos: ${
                n8nError.message || "Revisa la información proporcionada"
              }`;
          break;

        case 429:
          errorTitle = "⏰ Límite de Solicitudes";
          errorDescription =
            "Has excedido el límite de solicitudes permitidas. Intenta nuevamente en unos minutos.";
          break;

        case 500:
          errorTitle = "🔧 Error del Servidor";
          errorDescription = automationName
            ? `Error interno del servidor al ejecutar "${automationName}". Intenta nuevamente o contacta soporte.`
            : "Error interno del servidor. Intenta nuevamente o contacta soporte.";
          break;

        case 502:
        case 503:
        case 504:
          errorTitle = "🔌 Servicio No Disponible";
          errorDescription =
            "El servicio de automatizaciones no está disponible temporalmente. Intenta nuevamente en unos minutos.";
          break;

        default:
          errorTitle = "❌ Error de Automatización";
          errorDescription = automationName
            ? `Error al ejecutar "${automationName}": ${
                n8nError.message || "Error desconocido"
              }`
            : `Error en la automatización: ${
                n8nError.message || "Error desconocido"
              }`;
      }
    } else if (errorData.message) {
      // Error general con mensaje
      errorDescription = automationName
        ? `Error al ejecutar "${automationName}": ${errorData.message}`
        : `Error: ${errorData.message}`;
    }
  } else if (error.message) {
    // Error de red o conexión
    if (
      error.message.includes("Network Error") ||
      error.message.includes("fetch")
    ) {
      errorTitle = "🌐 Error de Conexión";
      errorDescription =
        "No se pudo conectar con el servidor de automatizaciones. Verifica tu conexión a internet.";
    } else if (error.message.includes("timeout")) {
      errorTitle = "⏰ Tiempo Agotado";
      errorDescription =
        "La solicitud tardó demasiado en procesarse. Intenta nuevamente.";
    } else {
      errorDescription = automationName
        ? `Error al ejecutar "${automationName}": ${error.message}`
        : `Error: ${error.message}`;
    }
  }

  return {
    title: errorTitle,
    description: errorDescription,
  };
}

/**
 * Determina si un error es recuperable (el usuario puede reintentar)
 */
export function isRecoverableError(statusCode?: number): boolean {
  if (!statusCode) return true;

  // Errores no recuperables (requieren intervención técnica)
  const nonRecoverableErrors = [401, 403, 404, 422];
  return !nonRecoverableErrors.includes(statusCode);
}

/**
 * Obtiene sugerencias de acción basadas en el tipo de error
 */
export function getErrorActionSuggestion(statusCode?: number): string | null {
  switch (statusCode) {
    case 404:
      return "Verifica que la automatización esté correctamente configurada en N8N.";
    case 401:
    case 403:
      return "Contacta al administrador para verificar tus permisos.";
    case 422:
      return "Revisa los datos que estás enviando e intenta nuevamente.";
    case 429:
      return "Espera unos minutos antes de intentar nuevamente.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Intenta nuevamente en unos minutos. Si persiste, contacta soporte.";
    default:
      return null;
  }
}
