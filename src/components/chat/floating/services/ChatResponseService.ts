import { ChatContextData, ModuleType } from "../context/ChatContext";
import { ChatButton } from "../types";

export interface ChatResponse {
  content: string;
  buttons?: ChatButton[];
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export class ChatResponseService {
  static generateResponse(
    message: string,
    context: ChatContextData | null
  ): ChatResponse {
    if (!context) {
      return this.getGeneralResponse(message);
    }

    switch (context.module) {
      case "deals":
        return this.getDealsResponse(message, context);
      case "contacts":
        return this.getContactsResponse(message, context);
      case "conversations":
        return this.getConversationsResponse(message, context);
      case "quotes":
        return this.getQuotesResponse(message, context);
      case "analytics":
        return this.getAnalyticsResponse(message, context);
      default:
        return this.getGeneralResponse(message);
    }
  }

  private static getDealsResponse(
    message: string,
    context: ChatContextData
  ): ChatResponse {
    const deals = context.data || [];
    const totalDeals = deals.length;

    if (
      message.toLowerCase().includes("estadística") ||
      message.toLowerCase().includes("estadisticas")
    ) {
      return {
        content: `Tienes ${totalDeals} deals en total. ¿Qué te gustaría saber específicamente?`,
        buttons: [
          {
            id: "deals-stats-1",
            text: "Ver por etapa",
            type: "action",
            variant: "secondary",
          },
          {
            id: "deals-stats-2",
            text: "Deals de mayor valor",
            type: "action",
            variant: "secondary",
          },
          {
            id: "deals-stats-3",
            text: "Preguntar a GPT",
            type: "gpt",
            variant: "primary",
          },
        ],
      };
    }

    if (
      message.toLowerCase().includes("conversión") ||
      message.toLowerCase().includes("conversion")
    ) {
      return {
        content:
          "Para mejorar tus tasas de conversión te recomiendo: 1) Hacer seguimiento regular, 2) Personalizar propuestas, 3) Identificar objeciones comunes.",
        suggestions: [
          "Ver deals estancados",
          "Analizar tiempo promedio de cierre",
          "Revisar motivos de pérdida",
        ],
      };
    }

    if (message.toLowerCase().includes("seguimiento")) {
      const pendingDeals = deals.filter(
        (deal: any) => deal.status === "pending" || deal.nextFollowUp
      );
      return {
        content: `Tienes ${pendingDeals.length} deals que necesitan seguimiento. Te recomiendo priorizarlos por valor y fecha de cierre.`,
        suggestions: [
          "Ver deals por prioridad",
          "Programar recordatorios",
          "Enviar propuestas pendientes",
        ],
      };
    }

    return {
      content: `Estás en la sección de Deals con ${totalDeals} registros. ¿En qué puedo ayudarte?`,
      buttons: [
        {
          id: "deals-default-1",
          text: "Ver estadísticas",
          type: "action",
          variant: "secondary",
        },
        {
          id: "deals-default-2",
          text: "Consejos de ventas",
          type: "action",
          variant: "secondary",
        },
        {
          id: "deals-default-3",
          text: "Preguntar a GPT",
          type: "gpt",
          variant: "primary",
        },
      ],
    };
  }

  private static getContactsResponse(
    message: string,
    context: ChatContextData
  ): ChatResponse {
    const contacts = context.data || [];
    const totalContacts = contacts.length;

    // Si estamos en ContactDetails, manejar de manera específica
    if (context.metadata?.currentPage === "contact-details") {
      return this.getContactDetailsResponse(message, context);
    }

    if (
      message.toLowerCase().includes("segmentar") ||
      message.toLowerCase().includes("segmentación")
    ) {
      return {
        content:
          "Para segmentar mejor tus contactos puedes usar: 1) Industria, 2) Tamaño de empresa, 3) Etapa del buyer journey, 4) Comportamiento de engagement.",
        suggestions: [
          "Crear segmento por industria",
          "Segmentar por actividad",
          "Agrupar por fuente de origen",
        ],
      };
    }

    if (message.toLowerCase().includes("campaña")) {
      return {
        content:
          "Para crear una campaña efectiva: 1) Define tu objetivo, 2) Segmenta tu audiencia, 3) Personaliza el mensaje, 4) Programa el timing adecuado.",
        suggestions: [
          "Crear campaña de email",
          "Campaña de WhatsApp masivo",
          "Secuencia de seguimiento",
        ],
      };
    }

    if (
      message.toLowerCase().includes("activos") ||
      message.toLowerCase().includes("actividad")
    ) {
      const activeContacts = contacts.filter(
        (contact: any) =>
          contact.lastActivity &&
          new Date(contact.lastActivity) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      return {
        content: `Tienes ${activeContacts.length} contactos activos en los últimos 30 días. Estos son tus mejores prospectos para engagement.`,
        suggestions: [
          "Ver contactos más activos",
          "Contactos sin actividad reciente",
          "Programar seguimiento",
        ],
      };
    }

    return {
      content: `Tienes ${totalContacts} contactos en tu base de datos. ¿Cómo puedo ayudarte a gestionarlos mejor?`,
      suggestions: [
        "Estrategias de segmentación",
        "Mejorar calidad de datos",
        "Automatizar seguimiento",
      ],
    };
  }

  private static getConversationsResponse(
    message: string,
    context: ChatContextData
  ): ChatResponse {
    const conversations = context.data || [];
    const totalConversations = conversations.length;

    if (
      message.toLowerCase().includes("tiempo de respuesta") ||
      message.toLowerCase().includes("respuesta")
    ) {
      return {
        content:
          "Para mejorar el tiempo de respuesta: 1) Usa plantillas predefinidas, 2) Configura respuestas automáticas, 3) Prioriza conversaciones urgentes.",
        suggestions: [
          "Crear plantillas de respuesta",
          "Configurar auto-respuestas",
          "Ver métricas de respuesta",
        ],
      };
    }

    if (message.toLowerCase().includes("pendientes")) {
      const pendingConversations = conversations.filter(
        (conv: any) => conv.status === "pending" || conv.requiresResponse
      );
      return {
        content: `Tienes ${pendingConversations.length} conversaciones pendientes de respuesta. Te recomiendo priorizarlas por urgencia.`,
        suggestions: [
          "Ver conversaciones urgentes",
          "Responder automáticamente",
          "Asignar a equipo",
        ],
      };
    }

    return {
      content: `Tienes ${totalConversations} conversaciones. ¿En qué puedo ayudarte con la gestión de comunicaciones?`,
      suggestions: [
        "Optimizar tiempos de respuesta",
        "Automatizar respuestas",
        "Analizar satisfacción del cliente",
      ],
    };
  }

  private static getQuotesResponse(
    message: string,
    context: ChatContextData
  ): ChatResponse {
    const quotes = context.data || [];
    const totalQuotes = quotes.length;

    if (
      message.toLowerCase().includes("optimizar") ||
      message.toLowerCase().includes("mejorar")
    ) {
      return {
        content:
          "Para optimizar tus cotizaciones: 1) Usa plantillas profesionales, 2) Incluye términos claros, 3) Agrega valor con descripciones detalladas, 4) Sigue up rápidamente.",
        suggestions: [
          "Crear plantillas de cotización",
          "Analizar tasas de aceptación",
          "Automatizar seguimiento",
        ],
      };
    }

    if (message.toLowerCase().includes("pendientes")) {
      const pendingQuotes = quotes.filter(
        (quote: any) => quote.status === "pending" || quote.status === "sent"
      );
      return {
        content: `Tienes ${pendingQuotes.length} cotizaciones pendientes. Es importante hacer seguimiento para aumentar las conversiones.`,
        suggestions: [
          "Hacer seguimiento de cotizaciones",
          "Ver cotizaciones vencidas",
          "Enviar recordatorios",
        ],
      };
    }

    return {
      content: `Tienes ${totalQuotes} cotizaciones. ¿Cómo puedo ayudarte a mejorar tu proceso de cotización?`,
      suggestions: [
        "Mejorar tasas de conversión",
        "Automatizar proceso",
        "Analizar productos más cotizados",
      ],
    };
  }

  private static getAnalyticsResponse(
    message: string,
    context: ChatContextData
  ): ChatResponse {
    if (
      message.toLowerCase().includes("explicar") ||
      message.toLowerCase().includes("explica")
    ) {
      return {
        content:
          "Estos datos muestran el rendimiento de tu negocio. Las métricas clave incluyen conversiones, tendencias temporales y comparativas de rendimiento.",
        suggestions: [
          "Ver tendencias mensuales",
          "Comparar con período anterior",
          "Identificar oportunidades",
        ],
      };
    }

    if (message.toLowerCase().includes("tendencias")) {
      return {
        content:
          "Las tendencias muestran patrones en tus datos. Busca picos, valles y patrones estacionales para tomar decisiones informadas.",
        suggestions: [
          "Analizar estacionalidad",
          "Identificar patrones de crecimiento",
          "Proyectar resultados futuros",
        ],
      };
    }

    if (message.toLowerCase().includes("recomendaciones")) {
      return {
        content:
          "Basado en tus datos, te recomiendo: 1) Enfocarte en los canales más rentables, 2) Optimizar procesos con baja conversión, 3) Invertir en áreas de crecimiento.",
        suggestions: [
          "Plan de acción basado en datos",
          "Optimizar canales de bajo rendimiento",
          "Escalar estrategias exitosas",
        ],
      };
    }

    return {
      content:
        "Estás viendo tus analytics. Puedo ayudarte a interpretar los datos y encontrar oportunidades de mejora.",
      suggestions: [
        "Interpretar métricas clave",
        "Identificar tendencias",
        "Generar recomendaciones",
      ],
    };
  }

  private static getContactDetailsResponse(
    message: string,
    context: ChatContextData
  ): ChatResponse {
    const contactData = context.data;
    const deals = contactData?.deals || [];

    if (
      message.toLowerCase().includes("valor promedio") ||
      message.toLowerCase().includes("promedio")
    ) {
      if (deals.length > 0) {
        const total = deals.reduce(
          (sum: number, deal: any) => sum + (deal.amount || 0),
          0
        );
        const avg = total / deals.length;
        return {
          content: `El valor promedio de compra de ${
            contactData.firstName
          } es $${avg.toFixed(
            2
          )}. Esto se calcula dividiendo el valor total ($${total.toLocaleString()}) entre ${
            deals.length
          } deals.`,
          buttons: [
            {
              id: "contact-details-1",
              text: "Ver detalles de deals",
              type: "action",
              variant: "secondary",
            },
            {
              id: "contact-details-2",
              text: "Análisis más profundo",
              type: "gpt",
              variant: "primary",
            },
          ],
        };
      } else {
        return {
          content: `${contactData.firstName} no tiene deals registrados aún. Te recomiendo crear el primer deal para comenzar a trackear el valor de compra.`,
          buttons: [
            {
              id: "contact-no-deals-1",
              text: "Crear primer deal",
              type: "action",
              variant: "primary",
            },
            {
              id: "contact-no-deals-2",
              text: "Estrategias de conversión",
              type: "gpt",
              variant: "secondary",
            },
          ],
        };
      }
    }

    if (
      message.toLowerCase().includes("análisis") ||
      message.toLowerCase().includes("estadística")
    ) {
      return {
        content: `Análisis del contacto ${contactData.firstName} ${contactData.lastName}:`,
        buttons: [
          {
            id: "contact-analysis-1",
            text: "Resumen de actividad",
            type: "action",
            variant: "secondary",
          },
          {
            id: "contact-analysis-2",
            text: "Potencial de negocio",
            type: "action",
            variant: "secondary",
          },
          {
            id: "contact-analysis-3",
            text: "Análisis con IA",
            type: "gpt",
            variant: "primary",
          },
        ],
      };
    }

    return {
      content: `Estás viendo el perfil de ${contactData.firstName} ${contactData.lastName}. ¿En qué puedo ayudarte?`,
      buttons: [
        {
          id: "contact-default-1",
          text: "Calcular valor promedio",
          type: "action",
          variant: "secondary",
        },
        {
          id: "contact-default-2",
          text: "Análisis del contacto",
          type: "action",
          variant: "secondary",
        },
        {
          id: "contact-default-3",
          text: "Preguntar a GPT",
          type: "gpt",
          variant: "primary",
        },
      ],
    };
  }

  private static getGeneralResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();

    // Comando especial para mostrar menú
    if (
      lowerMessage.includes("menu") ||
      lowerMessage.includes("menú") ||
      lowerMessage.includes("opciones")
    ) {
      return {
        content: "Aquí tienes las opciones principales:",
        buttons: [
          {
            id: "general-1",
            text: "Ver tutoriales",
            type: "action",
            variant: "secondary",
          },
          {
            id: "general-2",
            text: "Mejores prácticas",
            type: "action",
            variant: "secondary",
          },
          {
            id: "general-3",
            text: "Preguntar a GPT",
            type: "gpt",
            variant: "primary",
          },
        ],
      };
    }

    // Saludos simples
    if (
      lowerMessage.includes("hola") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("buenos")
    ) {
      return {
        content:
          "¡Hola! ¿En qué puedo ayudarte? Puedes escribir 'menú' para ver todas las opciones.",
        buttons: [
          {
            id: "quick-help",
            text: "Ver menú",
            type: "action",
            variant: "secondary",
          },
          {
            id: "gpt-hello",
            text: "Preguntar a GPT",
            type: "gpt",
            variant: "primary",
          },
        ],
      };
    }

    if (lowerMessage.includes("tutorial") || lowerMessage.includes("ayuda")) {
      return {
        content:
          "¡Perfecto! Puedo ayudarte con tutoriales sobre cualquier función de FusionCRM. ¿Qué te gustaría aprender?",
        suggestions: [
          "Cómo crear un deal",
          "Gestionar contactos",
          "Configurar automatizaciones",
          "Interpretar reportes",
        ],
      };
    }

    if (lowerMessage.includes("función") || lowerMessage.includes("usar")) {
      return {
        content:
          "Te puedo guiar sobre cómo usar cualquier función del CRM. Navega a la sección que te interesa y te daré consejos específicos.",
        suggestions: [
          "Ir a Deals",
          "Ir a Contactos",
          "Ir a Analytics",
          "Ver todas las funciones",
        ],
      };
    }

    // Respuesta por defecto más natural - SIN menú completo
    // Intentar dar una respuesta más específica basada en palabras clave
    if (
      lowerMessage.includes("problema") ||
      lowerMessage.includes("error") ||
      lowerMessage.includes("ayuda")
    ) {
      return {
        content:
          "Entiendo que necesitas ayuda. ¿Podrías contarme más detalles sobre el problema específico que tienes?",
        buttons: [
          {
            id: "help-gpt",
            text: "Explicar a GPT",
            type: "gpt",
            variant: "primary",
          },
        ],
      };
    }

    if (
      lowerMessage.includes("no funciona") ||
      lowerMessage.includes("no entiendo")
    ) {
      return {
        content:
          "Te entiendo. ¿Qué específicamente no está funcionando o qué parte no entiendes? Puedo ayudarte paso a paso.",
        buttons: [
          {
            id: "help-gpt",
            text: "Explicar a GPT",
            type: "gpt",
            variant: "primary",
          },
        ],
      };
    }

    return {
      content:
        "Entiendo. ¿Podrías darme más detalles sobre lo que necesitas? También puedes escribir 'menú' para ver todas las opciones disponibles.",
      buttons: [
        {
          id: "help-gpt",
          text: "Preguntar a GPT",
          type: "gpt",
          variant: "primary",
        },
      ],
    };
  }
}
