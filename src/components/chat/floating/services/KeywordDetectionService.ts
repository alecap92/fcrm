// Servicio para detectar palabras clave e intenciones en los mensajes del usuario

export interface KeywordMatch {
  intent: string;
  confidence: number;
  keywords: string[];
  action?: "gpt" | "response" | "menu";
}

export class KeywordDetectionService {
  // Patrones de palabras clave organizados por intención
  private static readonly KEYWORD_PATTERNS = {
    // Activar GPT
    gpt_activation: {
      keywords: [
        "preguntar a gpt",
        "pregunta gpt",
        "gpt",
        "chatgpt",
        "inteligencia artificial",
        "ia",
        "análisis profundo",
        "análisis detallado",
        "recomendación personalizada",
        "estrategia",
        "consejo avanzado",
        "insight",
        "predicción",
      ],
      action: "gpt" as const,
      confidence: 0.9,
    },

    // Mostrar menú
    menu_request: {
      keywords: [
        "menú",
        "menu",
        "opciones",
        "ayuda",
        "qué puedes hacer",
        "funciones",
        "comandos",
        "lista",
        "ver todo",
        "mostrar opciones",
      ],
      action: "menu" as const,
      confidence: 0.8,
    },

    // Tutoriales
    tutorial_request: {
      keywords: [
        "tutorial",
        "cómo",
        "como",
        "enseñar",
        "aprender",
        "guía",
        "paso a paso",
        "instrucciones",
        "manual",
        "explicar",
        "mostrar",
      ],
      action: "response" as const,
      confidence: 0.7,
    },

    // Estadísticas y análisis
    stats_request: {
      keywords: [
        "estadística",
        "estadisticas",
        "análisis",
        "analisis",
        "métricas",
        "metricas",
        "datos",
        "números",
        "cifras",
        "reporte",
        "resumen",
        "dashboard",
      ],
      action: "response" as const,
      confidence: 0.7,
    },

    // Valor promedio (específico para ContactDetails)
    average_value: {
      keywords: [
        "valor promedio",
        "promedio",
        "media",
        "precio promedio",
        "ticket promedio",
        "valor medio",
        "cuánto gasta",
        "cuanto gasta",
        "gasto promedio",
      ],
      action: "response" as const,
      confidence: 0.8,
    },

    // Deals y ventas
    deals_inquiry: {
      keywords: [
        "deals",
        "ventas",
        "oportunidades",
        "negocios",
        "pipeline",
        "conversión",
        "conversion",
        "cerrar venta",
        "seguimiento",
        "prospecto",
      ],
      action: "response" as const,
      confidence: 0.7,
    },

    // Contactos
    contacts_inquiry: {
      keywords: [
        "contactos",
        "clientes",
        "leads",
        "segmentación",
        "segmentacion",
        "base de datos",
        "crm",
        "gestión contactos",
        "gestion contactos",
      ],
      action: "response" as const,
      confidence: 0.7,
    },

    // Mejores prácticas
    best_practices: {
      keywords: [
        "mejores prácticas",
        "mejores practicas",
        "consejos",
        "tips",
        "recomendaciones",
        "buenas prácticas",
        "buenas practicas",
        "optimizar",
      ],
      action: "response" as const,
      confidence: 0.7,
    },

    // Saludos
    greetings: {
      keywords: [
        "hola",
        "hi",
        "hello",
        "buenos días",
        "buenos dias",
        "buenas tardes",
        "buenas noches",
        "saludos",
        "hey",
      ],
      action: "response" as const,
      confidence: 0.6,
    },
  };

  /**
   * Detecta la intención principal en un mensaje
   */
  static detectIntent(message: string): KeywordMatch | null {
    const lowerMessage = message.toLowerCase().trim();
    let bestMatch: KeywordMatch | null = null;
    let highestConfidence = 0;

    // Buscar en todos los patrones
    for (const [intent, pattern] of Object.entries(this.KEYWORD_PATTERNS)) {
      const matchedKeywords: string[] = [];
      let totalMatches = 0;

      // Verificar cada palabra clave del patrón
      for (const keyword of pattern.keywords) {
        if (lowerMessage.includes(keyword)) {
          matchedKeywords.push(keyword);
          totalMatches++;
        }
      }

      // Calcular confianza basada en coincidencias
      if (totalMatches > 0) {
        const confidence =
          (totalMatches / pattern.keywords.length) * pattern.confidence;

        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = {
            intent,
            confidence,
            keywords: matchedKeywords,
            action: pattern.action,
          };
        }
      }
    }

    // Solo retornar si la confianza es suficiente
    return bestMatch && bestMatch.confidence > 0.3 ? bestMatch : null;
  }

  /**
   * Detecta si el usuario quiere activar GPT específicamente
   */
  static shouldActivateGPT(message: string): boolean {
    // No activar GPT para mensajes muy cortos a menos que contengan palabras clave específicas
    if (message.length <= 2) {
      return false;
    }

    const match = this.detectIntent(message);
    return match?.action === "gpt" || this.hasGPTKeywords(message);
  }

  /**
   * Verifica si el mensaje contiene palabras clave específicas de GPT
   */
  private static hasGPTKeywords(message: string): boolean {
    const gptKeywords = [
      "preguntar a gpt",
      "pregunta gpt",
      "gpt",
      "chatgpt",
      "ia",
      "inteligencia artificial",
    ];

    const lowerMessage = message.toLowerCase();
    return gptKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Obtiene sugerencias de respuesta basadas en la intención detectada
   */
  static getSuggestedResponse(intent: string, message: string): string | null {
    const suggestions: Record<string, string> = {
      tutorial_request:
        "Te puedo ayudar con tutoriales. ¿Sobre qué función específica necesitas aprender?",
      stats_request:
        "Puedo mostrarte estadísticas y análisis. ¿Qué métricas te interesan?",
      deals_inquiry:
        "Perfecto, hablemos de deals y ventas. ¿Qué aspecto específico te interesa?",
      contacts_inquiry:
        "Excelente, puedo ayudarte con la gestión de contactos. ¿Qué necesitas saber?",
      best_practices:
        "Te puedo compartir mejores prácticas. ¿Para qué área específica?",
      greetings: "¡Hola! ¿En qué puedo ayudarte hoy?",
    };

    return suggestions[intent] || null;
  }

  /**
   * Verifica si el mensaje es una pregunta que requiere respuesta específica
   */
  static isQuestion(message: string): boolean {
    const questionWords = [
      "qué",
      "que",
      "cómo",
      "como",
      "cuándo",
      "cuando",
      "dónde",
      "donde",
      "por qué",
      "por que",
      "cuál",
      "cual",
    ];
    const lowerMessage = message.toLowerCase();

    return (
      questionWords.some((word) => lowerMessage.includes(word)) ||
      lowerMessage.includes("?") ||
      lowerMessage.startsWith("es ") ||
      lowerMessage.startsWith("puedes ") ||
      lowerMessage.startsWith("puedo ")
    );
  }

  /**
   * Extrae el contexto de la pregunta para mejorar la respuesta
   */
  static extractQuestionContext(message: string): {
    topic?: string;
    type: "how" | "what" | "when" | "where" | "why" | "which" | "general";
  } {
    const lowerMessage = message.toLowerCase();

    let type: "how" | "what" | "when" | "where" | "why" | "which" | "general" =
      "general";

    if (lowerMessage.includes("cómo") || lowerMessage.includes("como"))
      type = "how";
    else if (lowerMessage.includes("qué") || lowerMessage.includes("que"))
      type = "what";
    else if (lowerMessage.includes("cuándo") || lowerMessage.includes("cuando"))
      type = "when";
    else if (lowerMessage.includes("dónde") || lowerMessage.includes("donde"))
      type = "where";
    else if (
      lowerMessage.includes("por qué") ||
      lowerMessage.includes("por que")
    )
      type = "why";
    else if (lowerMessage.includes("cuál") || lowerMessage.includes("cual"))
      type = "which";

    return { type };
  }
}
