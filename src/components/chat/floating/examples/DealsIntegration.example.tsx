// EJEMPLO: Cómo integrar el chat contextual en un módulo
// Este archivo muestra cómo usar el chat flotante con datos contextuales

import { useEffect } from "react";
import { useChatModule } from "../index";

// Ejemplo para el módulo de Deals
export function DealsPageExample() {
  // 1. Inicializar el hook del chat para el módulo específico
  const chatModule = useChatModule("deals");

  // Datos simulados (en tu caso vendrían de tu contexto/estado)
  const deals = [
    { id: "1", title: "Deal 1", amount: 5000, status: { name: "pending" } },
    { id: "2", title: "Deal 2", amount: 10000, status: { name: "closed" } },
  ];

  const filters = { pipelineId: "pipeline-123" };

  // 2. Actualizar el contexto del chat cuando cambien los datos
  useEffect(() => {
    if (deals.length > 0) {
      // Enviar datos al contexto del chat
      chatModule.updateChatContext(deals, {
        currentPage: "deals",
        filters,
        totalCount: deals.length,
      });

      // 3. Agregar sugerencias dinámicas basadas en los datos
      const pendingDeals = deals.filter((deal) =>
        deal.status.name.toLowerCase().includes("pending")
      );

      if (pendingDeals.length > 0) {
        chatModule.sendSuggestion(
          `Tienes ${pendingDeals.length} deals pendientes`,
          () => {
            // Acción personalizada cuando se hace clic en la sugerencia
            console.log("Mostrando deals pendientes:", pendingDeals);
          }
        );
      }

      if (deals.length > 5) {
        chatModule.sendSuggestion("Muéstrame estadísticas de conversión");
      }
    }
  }, [deals, filters]);

  // 4. Función para enviar sugerencias específicas en eventos
  const handleDealCreated = (newDeal: any) => {
    chatModule.sendSuggestion(
      `¿Quieres configurar seguimiento para "${newDeal.title}"?`,
      () => {
        // Lógica para configurar seguimiento
        console.log("Configurando seguimiento para:", newDeal);
      }
    );
  };

  const handleDealStatusChanged = (deal: any, newStatus: string) => {
    if (newStatus === "closed") {
      chatModule.sendSuggestion(
        "¡Felicidades! ¿Quieres crear una factura para este deal?",
        () => {
          // Navegar a crear factura
          console.log("Creando factura para deal:", deal);
        }
      );
    }
  };

  return (
    <div>
      {/* Tu componente normal */}
      <h1>Deals Page</h1>
      {/* El chat flotante aparecerá automáticamente con el contexto */}
    </div>
  );
}

// Ejemplo para el módulo de Contactos
export function ContactsPageExample() {
  const chatModule = useChatModule("contacts");

  const contacts = [
    {
      id: "1",
      name: "Juan Pérez",
      company: "Empresa A",
      lastActivity: new Date(),
    },
    { id: "2", name: "María García", company: "Empresa B", lastActivity: null },
  ];

  useEffect(() => {
    if (contacts.length > 0) {
      chatModule.updateChatContext(contacts, {
        currentPage: "contacts",
        totalCount: contacts.length,
      });

      // Sugerencias específicas para contactos
      const inactiveContacts = contacts.filter((c) => !c.lastActivity);
      if (inactiveContacts.length > 0) {
        chatModule.sendSuggestion(
          `${inactiveContacts.length} contactos sin actividad reciente`
        );
      }
    }
  }, [contacts]);

  return <div>Contacts Page</div>;
}

// Ejemplo para Analytics
export function AnalyticsPageExample() {
  const chatModule = useChatModule("analytics");

  const analyticsData = {
    totalRevenue: 50000,
    conversionRate: 0.15,
    topProducts: ["Producto A", "Producto B"],
  };

  useEffect(() => {
    chatModule.updateChatContext(analyticsData, {
      currentPage: "analytics",
    });

    // Sugerencias basadas en métricas
    if (analyticsData.conversionRate < 0.1) {
      chatModule.sendSuggestion(
        "Tu tasa de conversión está baja, ¿quieres consejos?"
      );
    }
  }, [analyticsData]);

  return <div>Analytics Page</div>;
}

/*
INSTRUCCIONES DE USO:

1. Importa el hook en tu página/componente:
   import { useChatModule } from '../components/chat/floating';

2. Inicializa el hook con el tipo de módulo:
   const chatModule = useChatModule('deals'); // 'contacts', 'quotes', etc.

3. Actualiza el contexto cuando cambien tus datos:
   useEffect(() => {
     chatModule.updateChatContext(tusDatos, metadata);
   }, [tusDatos]);

4. Agrega sugerencias dinámicas:
   chatModule.sendSuggestion('Texto de la sugerencia', accionOpcional);

5. El chat flotante automáticamente:
   - Mostrará sugerencias relevantes al módulo
   - Generará respuestas contextuales
   - Tendrá acceso a los datos actuales de la página

TIPOS DE MÓDULOS DISPONIBLES:
- 'deals'
- 'contacts' 
- 'conversations'
- 'quotes'
- 'invoices'
- 'products'
- 'projects'
- 'analytics'
- 'automations'
- 'general'
*/
