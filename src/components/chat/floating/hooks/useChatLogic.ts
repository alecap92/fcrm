import { useState, useCallback, useEffect } from "react";
import { Message } from "../types";
import { useChatContext } from "../context/ChatContext";
import { ChatResponseService } from "../services/ChatResponseService";
import { GPTService } from "../services/GPTService";
import { KeywordDetectionService } from "../services/KeywordDetectionService";

const INITIAL_MESSAGES: Message[] = [
  // {
  //   id: "1",
  //   content:
  //     "¡Hola! Soy tu asistente de FusionCRM. ¿En qué puedo ayudarte hoy?",
  //   sender: "assistant",
  //   timestamp: new Date(),
  // },
  // {
  //   id: "2",
  //   content:
  //     "Puedo ayudarte con información sobre la organización, tutoriales, consejos y responder preguntas sobre el CRM.",
  //   sender: "assistant",
  //   timestamp: new Date(),
  //   buttons: [
  //     {
  //       id: "initial-1",
  //       text: "Ver tutoriales",
  //       type: "action",
  //       variant: "secondary",
  //     },
  //     {
  //       id: "initial-3",
  //       text: "Preguntar a GPT",
  //       type: "gpt",
  //       variant: "primary",
  //     },
  //   ],
  // },
];

const SAMPLE_RESPONSES = [
  "Gracias por tu mensaje. Esta es una respuesta de ejemplo. Pronto estaré conectado con IA para brindarte respuestas más inteligentes.",
  "¡Excelente pregunta! Estoy aquí para ayudarte con cualquier duda sobre FusionCRM.",
  "Entiendo tu consulta. En el futuro podré brindarte respuestas más específicas y útiles.",
  "Perfecto, estoy procesando tu solicitud. Pronto tendré capacidades de IA más avanzadas.",
];

// Helper function para obtener el nombre del mes actual
const getCurrentMonthName = () => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[new Date().getMonth()];
};

// Helper function para obtener el nombre del mes anterior
const getPreviousMonthName = () => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const previousMonth = new Date().getMonth() - 1;
  const monthIndex = previousMonth < 0 ? 11 : previousMonth;
  return months[monthIndex];
};

// Helper function para obtener el año anterior si es necesario
const getPreviousYearIfNeeded = () => {
  const currentDate = new Date();
  const previousMonth = currentDate.getMonth() - 1;
  return previousMonth < 0
    ? currentDate.getFullYear() - 1
    : currentDate.getFullYear();
};

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [awaitingGptResponse, setAwaitingGptResponse] = useState(false);
  const {
    contextData,
    sendContextualMessage,
    registerMessageHandler,
    unregisterMessageHandler,
  } = useChatContext();

  const addMessage = useCallback(
    (
      content: string,
      sender: "user" | "assistant",
      buttons?: any[],
      options?: { variant?: "default" | "warning" | "info"; icon?: string }
    ) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        sender,
        timestamp: new Date(),
        buttons,
        ...options,
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    },
    []
  );

  // Registrar el handler de mensajes al montar el componente
  useEffect(() => {
    const messageHandler = async (
      content: string,
      sender: "user" | "assistant",
      buttons?: any[],
      options?: { variant?: "default" | "warning" | "info"; icon?: string }
    ) => {
      addMessage(content, sender, buttons, options);
    };
    registerMessageHandler(messageHandler);
    return () => {
      unregisterMessageHandler();
    };
  }, [addMessage, registerMessageHandler, unregisterMessageHandler]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Agregar mensaje del usuario
      addMessage(content, "user");
      setIsTyping(true);

      try {
        // 1. Detectar intención del mensaje
        const detectedIntent = KeywordDetectionService.detectIntent(content);
        const shouldUseGPT = KeywordDetectionService.shouldActivateGPT(content);

        // 2. Si el usuario quiere GPT específicamente o ya estamos en modo GPT
        if (
          shouldUseGPT ||
          awaitingGptResponse // Si estamos esperando respuesta de GPT, enviar cualquier mensaje a GPT
        ) {
          try {
            // Activar modo GPT si no estaba activo
            if (!awaitingGptResponse) {
              setAwaitingGptResponse(true);
              setShowTextInput(true);
            }

            // Si el mensaje es muy corto y estamos en modo GPT, pedir más detalles
            if (awaitingGptResponse && content.length <= 2) {
              addMessage(
                "Tu mensaje es muy corto. ¿Podrías darme más detalles sobre lo que necesitas? Por ejemplo, puedes preguntar sobre estrategias, análisis, o cualquier tema específico.",
                "assistant",
                [
                  {
                    id: "gpt-continue",
                    text: "Continuar con GPT",
                    type: "gpt",
                    variant: "primary",
                  },
                ],
                { variant: "warning" }
              );
              setIsTyping(false);
              return;
            }

            const gptResponse = await GPTService.sendMessage({
              message: content,
              context: contextData || undefined,
            });

            addMessage(
              gptResponse.content,
              "assistant",
              [
                {
                  id: "gpt-follow-up",
                  text: "Preguntar algo más a GPT",
                  type: "gpt",
                  variant: "primary",
                },
              ],
              { variant: "info", icon: "🤖" }
            );
            setAwaitingGptResponse(false);
          } catch (error) {
            console.error("Error with GPT:", error);
            addMessage(
              "Lo siento, no pude conectar con GPT en este momento. Sin embargo, puedo ayudarte con información básica. ¿Qué necesitas saber?",
              "assistant",
              [
                {
                  id: "gpt-retry",
                  text: "Intentar GPT de nuevo",
                  type: "gpt",
                  variant: "primary",
                },
                {
                  id: "help-basic",
                  text: "Ayuda básica",
                  type: "action",
                  variant: "secondary",
                },
              ],
              { variant: "warning", icon: "❌" }
            );
            setAwaitingGptResponse(false);
          }
        }
        // 3. Si se detectó una intención específica, responder según la intención
        else if (detectedIntent) {
          setTimeout(() => {
            let responseContent = "";
            let buttons: any[] = [];

            switch (detectedIntent.action) {
              case "menu":
                responseContent = "Aquí tienes las opciones principales:";
                buttons = [
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
                ];
                break;

              case "response":
                // Usar el servicio de respuestas contextual para respuestas específicas
                const contextualResponse = ChatResponseService.generateResponse(
                  content,
                  contextData
                );
                responseContent = contextualResponse.content;
                buttons = contextualResponse.buttons || [];
                break;

              default:
                // Respuesta sugerida basada en la intención
                const suggestedResponse =
                  KeywordDetectionService.getSuggestedResponse(
                    detectedIntent.intent,
                    content
                  );
                responseContent =
                  suggestedResponse ||
                  "Entiendo tu consulta. ¿Podrías ser más específico?";
                buttons = [
                  {
                    id: "help-gpt",
                    text: "Preguntar a GPT",
                    type: "gpt",
                    variant: "primary",
                  },
                ];
            }

            addMessage(responseContent, "assistant", buttons, {
              variant: "info",
              icon: "💡",
            });
            setIsTyping(false);
          }, 800 + Math.random() * 400);
        }
        // 4. Si no se detectó intención específica, usar respuesta contextual
        else {
          setTimeout(() => {
            const response = ChatResponseService.generateResponse(
              content,
              contextData
            );
            addMessage(response.content, "assistant", response.buttons);
            setIsTyping(false);
          }, 1000 + Math.random() * 1000);
        }

        setIsTyping(false);
        setShowTextInput(false); // Ocultar input después de respuesta

        // Llamar función contextual si existe
        sendContextualMessage(content);
      } catch (error) {
        console.error("Error sending message:", error);
        addMessage(
          "Lo siento, hubo un error procesando tu mensaje.",
          "assistant"
        );
        setIsTyping(false);
      }
    },
    [addMessage, contextData, sendContextualMessage, awaitingGptResponse]
  );

  const clearMessages = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setIsTyping(false);
    setShowTextInput(false);
    setAwaitingGptResponse(false);
  }, [addMessage]);

  const handleButtonClick = useCallback(
    async (button: any) => {
      // Primero agregar el mensaje del usuario con el texto del botón
      addMessage(button.text, "user");

      if (button.type === "gpt") {
        // Habilitar input para preguntar a GPT
        setShowTextInput(true);
        setAwaitingGptResponse(true);

        // Agregar mensaje indicando que puede escribir
        addMessage(
          "Perfecto, ahora puedes escribir tu pregunta específica y la enviaré a GPT para obtener una respuesta más detallada. Por favor, sé específico en tu consulta.",
          "assistant"
        );
      } else if (button.type === "action") {
        // Ejecutar acción predefinida
        if (button.action) {
          button.action();
        } else {
          // Simular respuesta para acciones predefinidas
          await handleActionButton(button);
        }
      } else if (button.type === "suggestion") {
        // Tratar como mensaje normal
        sendMessage(button.text);
      }
    },
    [addMessage, sendMessage]
  );

  const handleActionButton = useCallback(
    async (button: any) => {
      setIsTyping(true);

      setTimeout(async () => {
        let responseContent = "";

        // Respuestas específicas por ID de botón
        switch (button.id) {
          case "deals-tutorial":
            addMessage(
              "📚 ¡Perfecto! Te explico cómo funcionan los deals.",
              "assistant"
            );

            setTimeout(() => {
              addMessage(
                "En los deals, puedes crear las oportunidades de venta de tu empresa. Puedes personalizar cada etapa e inclusive puedes crear varios Pipelines o flujos de venta.",
                "assistant"
              );
            }, 1000);

            setTimeout(() => {
              addMessage(
                "Por ejemplo, si vendes camisetas, puedes crear un Pipeline para cada color de camiseta. ¿Te gustaría que te muestre cómo crear tu primer deal?",
                "assistant",
                []
              );
            }, 2500);

            setIsTyping(false);
            return;

          case "deals-monthly-sales":
            console.log("🔍 Verificando contextData:", contextData);
            console.log(
              "🔍 getDealsStats existe:",
              !!contextData?.getDealsStats
            );

            if (contextData?.getDealsStats) {
              try {
                console.log("📊 Llamando getDealsStats con period: current");
                const stats = await contextData.getDealsStats("current");
                console.log("📊 Estadísticas recibidas:", stats);

                if (stats) {
                  responseContent =
                    `💰 **Reporte de ${stats.month} ${stats.year}**\n\n` +
                    `📊 **Deals totales:** ${stats.totalDeals}\n` +
                    `💵 **Valor total:** $${stats.totalAmount.toLocaleString()}\n` +
                    `✅ **Deals cerrados:** ${stats.closedDeals}\n` +
                    `🎯 **Ventas cerradas:** $${stats.closedAmount.toLocaleString()}\n` +
                    `📈 **Promedio por deal:** $${stats.averageAmount.toLocaleString()}\n` +
                    `🎯 **Tasa de conversión:** ${stats.conversionRate}%`;
                } else {
                  responseContent = `📊 No hay datos de deals disponibles para ${getCurrentMonthName()} ${new Date().getFullYear()}.`;
                }
              } catch (error) {
                console.error("Error obteniendo estadísticas:", error);
                responseContent =
                  "❌ Error al obtener las estadísticas de deals.";
              }
            } else {
              console.log("❌ getDealsStats no está disponible en contextData");
              responseContent =
                "❌ No hay datos de deals disponibles en este momento.";
            }
            break;

          case "deals-previous-sales":
            if (contextData?.getDealsStats) {
              try {
                const stats = await contextData.getDealsStats("previous");
                if (stats) {
                  responseContent =
                    `📅 **Reporte de ${stats.month} ${stats.year}**\n\n` +
                    `📊 **Deals totales:** ${stats.totalDeals}\n` +
                    `💵 **Valor total:** $${stats.totalAmount.toLocaleString()}\n` +
                    `✅ **Deals cerrados:** ${stats.closedDeals}\n` +
                    `🎯 **Ventas cerradas:** $${stats.closedAmount.toLocaleString()}\n` +
                    `📈 **Promedio por deal:** $${stats.averageAmount.toLocaleString()}\n` +
                    `🎯 **Tasa de conversión:** ${stats.conversionRate}%`;
                } else {
                  responseContent = `📊 No hay datos de deals disponibles para ${getPreviousMonthName()} ${getPreviousYearIfNeeded()}.`;
                }
              } catch (error) {
                console.error("Error obteniendo estadísticas:", error);
                responseContent =
                  "❌ Error al obtener las estadísticas de deals.";
              }
            } else {
              responseContent =
                "❌ No hay datos de deals disponibles en este momento.";
            }
            break;
          case "deals-products-sold":
            console.log(
              "🔍 Verificando contextData para productos:",
              contextData
            );
            console.log(
              "🔍 getTopSellingProducts existe:",
              !!contextData?.getTopSellingProducts
            );

            if (contextData?.getTopSellingProducts) {
              try {
                console.log(
                  "🛍️ Llamando getTopSellingProducts con period: current"
                );
                // Temporal: intentar con diferentes períodos para encontrar datos
                let topProducts = await contextData.getTopSellingProducts(
                  "current",
                  5
                );

                // Si no hay datos en el período actual, intentar con período anterior
                if (
                  !topProducts ||
                  !topProducts.topByQuantity ||
                  topProducts.topByQuantity.length === 0
                ) {
                  console.log(
                    "🛍️ No hay datos en período actual, intentando período anterior"
                  );
                  topProducts = await contextData.getTopSellingProducts(
                    "previous",
                    5
                  );
                }

                console.log(
                  "🛍️ Productos más vendidos recibidos:",
                  topProducts
                );

                console.log("🛍️ Top products structure:", {
                  hasTopByQuantity: !!topProducts?.topByQuantity,
                  topByQuantityLength: topProducts?.topByQuantity?.length || 0,
                  period: topProducts?.period,
                  month: topProducts?.month,
                  year: topProducts?.year,
                  startDate: topProducts?.startDate,
                  endDate: topProducts?.endDate,
                  summary: topProducts?.summary,
                });

                console.log(
                  "🛍️ Full response details:",
                  JSON.stringify(topProducts, null, 2)
                );

                if (
                  topProducts &&
                  topProducts.topByQuantity &&
                  topProducts.topByQuantity.length > 0
                ) {
                  let productsList = topProducts.topByQuantity
                    .map(
                      (product: any, index: number) =>
                        `${index + 1}. **${
                          product.productName
                        }**\n   📦 Cantidad: ${
                          product.totalQuantitySold
                        } unidades\n   💰 Ingresos: $${product.totalRevenue.toLocaleString()}\n   🏷️ Precio promedio: $${Math.round(
                          product.averagePrice
                        ).toLocaleString()}`
                    )
                    .join("\n\n");

                  responseContent =
                    `🏆 **Top 5 Productos Más Vendidos - ${topProducts.month} ${topProducts.year}**\n\n` +
                    `${productsList}\n\n` +
                    `📊 **Resumen Total:**\n` +
                    `• Total productos únicos: ${topProducts.summary.totalProducts}\n` +
                    `• Cantidad total vendida: ${topProducts.summary.totalQuantitySold} unidades\n` +
                    `• Ingresos totales: $${topProducts.summary.totalRevenue.toLocaleString()}`;
                } else {
                  responseContent = `📊 No hay datos de productos vendidos disponibles para ${
                    topProducts?.month || "el período actual"
                  } ${topProducts?.year || new Date().getFullYear()}.`;
                }
              } catch (error) {
                console.error(
                  "Error obteniendo productos más vendidos:",
                  error
                );
                responseContent =
                  "❌ Error al obtener los productos más vendidos.";
              }
            } else {
              console.log(
                "❌ getTopSellingProducts no está disponible en contextData"
              );
              responseContent =
                "❌ No hay datos de productos disponibles en este momento.";
            }
            break;
          case "deals-default-2":
            responseContent =
              "Consejos para cerrar más ventas: 1) Haz seguimiento cada 3 días, 2) Personaliza cada propuesta, 3) Identifica el decision maker, 4) Crea urgencia genuina.";
            break;
          case "general-1":
            responseContent =
              "Tutoriales disponibles: Crear deals, Gestionar contactos, Configurar pipelines, Automatizaciones, Reportes avanzados.";
            break;
          case "general-2":
            responseContent =
              "Mejores prácticas: 1) Actualiza datos regularmente, 2) Usa tags para organizar, 3) Configura automatizaciones, 4) Revisa métricas semanalmente.";
            break;
          case "quick-help":
            responseContent = "Aquí tienes las opciones principales:";
            // Agregar botones específicos para el menú
            addMessage(responseContent, "assistant", [
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
            ]);
            setIsTyping(false);
            return; // Salir temprano para evitar el addMessage al final
          case "help-basic":
            responseContent =
              "Puedo ayudarte con información básica sobre FusionCRM. ¿Qué necesitas saber específicamente?";
            break;
          case "gpt-retry":
          case "gpt-continue":
            // Reactivar GPT
            setShowTextInput(true);
            setAwaitingGptResponse(true);
            responseContent =
              "Perfecto, ahora puedes escribir tu pregunta completa para GPT:";
            break;
          case "contact-default-1":
            // Calcular valor promedio desde el contexto
            if (contextData?.data?.deals) {
              const deals = contextData.data.deals;
              const total = deals.reduce(
                (sum: number, deal: any) => sum + (deal.amount || 0),
                0
              );
              const avg = total / deals.length;
              responseContent = `El valor promedio de compra es $${avg.toFixed(
                2
              )}. Calculado desde ${
                deals.length
              } deals con un total de $${total.toLocaleString()}.`;
            } else {
              responseContent =
                "No hay deals disponibles para calcular el valor promedio.";
            }
            break;
          case "contact-details-1":
            if (contextData?.data?.deals) {
              const deals = contextData.data.deals;
              const dealsList = deals
                .map(
                  (deal: any, index: number) =>
                    `${index + 1}. ${deal.title}: $${
                      deal.amount?.toLocaleString() || 0
                    } (${deal.status?.name || "Sin estado"})`
                )
                .join("\n");
              responseContent = `Detalles de deals:\n${dealsList}`;
            } else {
              responseContent = "No hay deals disponibles para mostrar.";
            }
            break;
          case "contact-analysis-1":
            if (contextData?.data) {
              const contact = contextData.data;
              const dealsCount = contact.deals?.length || 0;
              const totalValue =
                contact.deals?.reduce(
                  (sum: number, deal: any) => sum + (deal.amount || 0),
                  0
                ) || 0;
              responseContent = `Resumen de actividad:
              - Total de deals: ${dealsCount}
              - Valor total: $${totalValue.toLocaleString()}
              - Empresa: ${contact.companyName || "No especificada"}
              - Lead Score: ${contact.leadScore || "No calculado"}`;
            } else {
              responseContent = "No hay datos suficientes para el análisis.";
            }
            break;
          case "contact-analysis-2":
            if (contextData?.data?.deals) {
              const deals = contextData.data.deals;
              const avgDeal =
                deals.length > 0
                  ? deals.reduce(
                      (sum: number, deal: any) => sum + (deal.amount || 0),
                      0
                    ) / deals.length
                  : 0;
              const potential = avgDeal * 2; // Estimación simple
              responseContent = `Potencial de negocio estimado:
              - Valor promedio actual: $${avgDeal.toFixed(2)}
              - Potencial estimado: $${potential.toFixed(2)}
              - Recomendación: ${
                avgDeal > 5000
                  ? "Cliente de alto valor, mantener relación estrecha"
                  : "Oportunidad de crecimiento, considerar upselling"
              }`;
            } else {
              responseContent =
                "Sin deals históricos, el potencial se basa en el perfil del contacto y la industria.";
            }
            break;
          default:
            responseContent =
              "Acción ejecutada correctamente. ¿Hay algo más en lo que pueda ayudarte?";
        }

        addMessage(responseContent, "assistant", [
          {
            id: "follow-up-gpt",
            text: "Preguntar a GPT",
            type: "gpt",
            variant: "primary",
          },
        ]);
        setIsTyping(false);
      }, 1000);
    },
    [addMessage, contextData]
  );

  return {
    messages,
    isTyping,
    showTextInput,
    awaitingGptResponse,
    sendMessage,
    clearMessages,
    handleButtonClick,
    setShowTextInput,
    addMessage,
  };
};
