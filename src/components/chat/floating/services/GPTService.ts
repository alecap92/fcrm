// Servicio para manejar llamadas a GPT
// Este servicio se activará solo cuando el usuario haga clic en "Preguntar a GPT"

import { ChatContextData } from "../context/ChatContext";
import { authService } from "../../../../config/authConfig";

export interface GPTRequest {
  message: string;
  context?: ChatContextData;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface GPTResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GPTService {
  private static readonly API_ENDPOINT = "/api/v1/chat/gpt";

  // Método principal para enviar mensaje a GPT
  static async sendMessage(request: GPTRequest): Promise<GPTResponse> {
    try {
      // Construir el prompt del sistema basado en el contexto
      const systemPrompt = this.buildSystemPrompt(request.context);

      // Preparar los mensajes para la API
      const messages = [
        { role: "system", content: systemPrompt },
        ...(request.conversationHistory || []),
        { role: "user", content: request.message },
      ];

      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();

      return {
        content: data.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error) {
      console.error("Error calling GPT:", error);

      // Determinar tipo de error y respuesta apropiada
      let errorMessage = "Lo siento, no pude conectar con GPT en este momento.";

      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage =
            "Error de autenticación. Por favor, inicia sesión de nuevo.";
        } else if (error.message.includes("429")) {
          errorMessage =
            "Has alcanzado el límite de consultas. Espera un momento antes de intentar de nuevo.";
        } else if (error.message.includes("404")) {
          errorMessage =
            "El servicio de GPT no está disponible en este momento.";
        }
      }

      // Intentar respuesta de fallback inteligente
      const fallbackContent = this.getFallbackResponse(
        request.message,
        request.context
      );

      // Si hay una respuesta de fallback útil, combinarla
      if (
        fallbackContent !==
        "Lo siento, no pude conectar con GPT en este momento. Por favor intenta de nuevo más tarde."
      ) {
        return {
          content: `${errorMessage} Sin embargo, puedo ayudarte con esto: ${fallbackContent}`,
        };
      }

      return {
        content: errorMessage,
      };
    }
  }

  // Construir prompt del sistema basado en el contexto
  private static buildSystemPrompt(context?: ChatContextData): string {
    let prompt = `Eres un asistente experto en CRM y análisis de datos para FusionCRM. 
    Ayudas a los usuarios con análisis de datos, insights de negocio, y recomendaciones estratégicas.
    Responde de manera concisa y práctica, enfocándote en acciones específicas.
    Siempre responde en español con un tono profesional pero amigable.`;

    if (context) {
      prompt += `\n\nContexto actual:
      - Módulo: ${context.module}
      - Página: ${context.metadata?.currentPage || "No especificada"}`;

      if (context.data && Array.isArray(context.data)) {
        prompt += `\n- Total de registros: ${context.data.length}`;

        // Agregar información específica por módulo
        switch (context.module) {
          case "deals":
            const dealStats = this.analyzeDealData(context.data);
            prompt += `\n- Estadísticas de deals: ${dealStats}`;
            break;
          case "contacts":
            const contactStats = this.analyzeContactData(context.data);
            prompt += `\n- Estadísticas de contactos: ${contactStats}`;
            break;
        }
      }

      // Si estamos en ContactDetails, agregar información específica
      if (context.metadata?.currentPage === "contact-details" && context.data) {
        const contactData = context.data;
        prompt += `\n\nDatos del contacto actual:
        - Nombre: ${contactData.firstName} ${contactData.lastName}
        - Empresa: ${contactData.companyName}
        - Total de deals: ${contactData.deals?.length || 0}`;

        if (contactData.deals && contactData.deals.length > 0) {
          const totalRevenue = contactData.deals.reduce(
            (sum: number, deal: any) => sum + (deal.amount || 0),
            0
          );
          const avgDeal = totalRevenue / contactData.deals.length;
          prompt += `\n- Valor total en deals: $${totalRevenue.toLocaleString()}
        - Valor promedio por deal: $${avgDeal.toFixed(2)}`;
        }
      }
    }

    return prompt;
  }

  // Analizar datos de deals
  private static analyzeDealData(deals: any[]): string {
    if (!deals.length) return "Sin datos";

    const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const avgValue = totalValue / deals.length;
    const stages = deals.reduce((acc, deal) => {
      const stage = deal.status?.name || "Sin etapa";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    return `Valor total: $${totalValue.toLocaleString()}, Promedio: $${avgValue.toFixed(
      0
    )}, Etapas: ${Object.entries(stages)
      .map(([k, v]) => `${k}(${v})`)
      .join(", ")}`;
  }

  // Analizar datos de contactos
  private static analyzeContactData(contacts: any[]): string {
    if (!contacts.length) return "Sin datos";

    const companies = new Set(
      contacts.map((c) => c.companyName).filter(Boolean)
    ).size;
    const withActivity = contacts.filter((c) => c.lastActivity).length;

    return `Total: ${contacts.length}, Empresas: ${companies}, Con actividad reciente: ${withActivity}`;
  }

  // Respuesta de fallback cuando falla la API
  private static getFallbackResponse(
    message: string,
    context?: ChatContextData
  ): string {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("valor promedio") ||
      lowerMessage.includes("promedio")
    ) {
      if (context?.data?.deals) {
        const deals = context.data.deals;
        const total = deals.reduce(
          (sum: number, deal: any) => sum + (deal.amount || 0),
          0
        );
        const avg = total / deals.length;
        return `El valor promedio de compra es $${avg.toFixed(
          2
        )}. Esto se calcula dividiendo el valor total ($${total.toLocaleString()}) entre ${
          deals.length
        } deals.`;
      }
    }

    if (
      lowerMessage.includes("estadística") ||
      lowerMessage.includes("análisis")
    ) {
      return "Para obtener estadísticas detalladas, te recomiendo revisar la sección de Analytics donde encontrarás métricas completas y visualizaciones.";
    }

    return "Lo siento, no pude conectar con GPT en este momento. Por favor intenta de nuevo más tarde.";
  }

  // Obtener token de autenticación
  private static getAuthToken(): string {
    const token = authService.getToken();
    console.log(
      "GPT Service - Token status:",
      token ? "Token found" : "No token"
    );
    return token || "";
  }

  // Verificar si se debe usar GPT
  static shouldUseGPT(message: string): boolean {
    return message.length > 2 && !this.hasSimpleAnswer(message);
  }

  // Verificar si tiene respuesta simple
  private static hasSimpleAnswer(message: string): boolean {
    const simpleKeywords = ["hola", "gracias", "adiós"];
    return simpleKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );
  }

  // Estimar tokens para control de costos
  static estimateTokens(message: string, context?: ChatContextData): number {
    const systemPrompt = this.buildSystemPrompt(context);
    const totalText = systemPrompt + message;

    // Estimación aproximada: 1 token ≈ 4 caracteres en español
    return Math.ceil(totalText.length / 4);
  }
}
