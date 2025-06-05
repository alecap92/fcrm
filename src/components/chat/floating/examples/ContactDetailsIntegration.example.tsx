// EJEMPLO: Integración del chat contextual en ContactDetails
// Este archivo muestra cómo integrar el chat flotante con datos específicos de contacto

import { useEffect } from "react";
import { useChatModule } from "../index";

export function ContactDetailsIntegrationExample() {
  // 1. Inicializar el hook del chat para contactos
  const chatModule = useChatModule("contacts");

  // Datos simulados del contacto (en tu caso vendrían del estado)
  const contactDetails = {
    _id: "contact-123",
    firstName: "Juan",
    lastName: "Pérez",
    companyName: "Empresa ABC",
    email: "juan@empresa.com",
    leadScore: 85,
  };

  const deals = [
    {
      _id: "1",
      title: "Deal 1",
      amount: 15000,
      status: { name: "Negociación" },
    },
    { _id: "2", title: "Deal 2", amount: 8000, status: { name: "Cerrado" } },
    { _id: "3", title: "Deal 3", amount: 12000, status: { name: "Propuesta" } },
  ];

  const dailyMetrics = {
    totalRevenue: "35000",
    totalDeals: 3,
    lastDeal: { createdAt: new Date() },
  };

  // 2. Actualizar contexto cuando cambien los datos
  useEffect(() => {
    if (contactDetails._id && deals.length >= 0) {
      // Preparar datos completos para el chat
      const contactDataForChat = {
        ...contactDetails,
        deals,
        leadScore: contactDetails.leadScore,
        dailyMetrics,
      };

      // Enviar contexto al chat
      chatModule.updateChatContext(contactDataForChat, {
        currentPage: "contact-details",
        totalCount: deals.length,
      });

      // 3. Agregar sugerencias dinámicas basadas en los datos
      if (deals.length > 0) {
        const totalValue = deals.reduce(
          (sum, deal) => sum + (deal.amount || 0),
          0
        );
        const avgValue = totalValue / deals.length;

        // Sugerencia para clientes de alto valor
        if (avgValue > 10000) {
          chatModule.sendSuggestion(
            "Este es un cliente de alto valor, ¿cómo mantener la relación?"
          );
        }

        // Sugerencia para calcular valor promedio
        chatModule.sendSuggestion(
          "¿Cuál es el valor promedio de compra de este contacto?"
        );

        // Sugerencia para análisis
        if (contactDetails.leadScore > 80) {
          chatModule.sendSuggestion(
            "Lead Score alto, ¿estrategias para cerrar más deals?"
          );
        }
      } else {
        // Sugerencias para contactos sin deals
        chatModule.sendSuggestion(
          "¿Cómo convertir este contacto en su primer deal?"
        );
      }
    }
  }, [contactDetails, deals, dailyMetrics]);

  return (
    <div>
      <h1>Contact Details Page</h1>
      {/* El chat flotante aparecerá automáticamente con el contexto */}
    </div>
  );
}

/*
FUNCIONALIDADES IMPLEMENTADAS:

1. **Cálculo de Valor Promedio**:
   - Botón: "Calcular valor promedio" → Respuesta inmediata con cálculo
   - GPT: "¿Cuál es el valor promedio?" → Análisis detallado con IA

2. **Análisis del Contacto**:
   - Botón: "Análisis del contacto" → Resumen de actividad
   - GPT: Análisis profundo con recomendaciones personalizadas

3. **Respuestas Contextuales**:
   - El chat conoce todos los deals del contacto
   - Puede calcular métricas sin llamar a la API
   - GPT recibe contexto completo para análisis avanzado

4. **Ejemplos de Preguntas para GPT**:
   - "¿Qué estrategias recomiendas para este cliente de alto valor?"
   - "¿Cómo puedo aumentar el valor promedio de compra?"
   - "¿Qué patrones ves en los deals de este contacto?"
   - "¿Cuándo es el mejor momento para hacer follow-up?"

5. **Control de Costos**:
   - Cálculos simples (promedio, suma) se hacen localmente
   - GPT solo para análisis complejos y recomendaciones
   - Usuario decide cuándo usar IA

FLUJO DE EJEMPLO:

Usuario en ContactDetails → Ve botón "Calcular valor promedio"
├── Opción 1: Click en botón → Respuesta inmediata: "$11,666.67"
└── Opción 2: Click "Preguntar a GPT" → Input aparece
    └── Escribe: "¿Cómo aumentar el valor promedio?"
        └── GPT responde con estrategias personalizadas

*/
