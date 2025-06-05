import { useState, useCallback } from "react";
import { Message } from "../types";
import { useChatContext } from "../context/ChatContext";
import { ChatResponseService } from "../services/ChatResponseService";
import { GPTService } from "../services/GPTService";
import { KeywordDetectionService } from "../services/KeywordDetectionService";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    content:
      "¡Hola! Soy tu asistente de FusionCRM. ¿En qué puedo ayudarte hoy?",
    sender: "assistant",
    timestamp: new Date(),
  },
  {
    id: "2",
    content:
      "Puedo ayudarte con información sobre la organización, tutoriales, consejos y responder preguntas sobre el CRM.",
    sender: "assistant",
    timestamp: new Date(),
    buttons: [
      {
        id: "initial-1",
        text: "Ver tutoriales",
        type: "action",
        variant: "secondary",
      },
      {
        id: "initial-2",
        text: "Mejores prácticas",
        type: "action",
        variant: "secondary",
      },
      {
        id: "initial-3",
        text: "Preguntar a GPT",
        type: "gpt",
        variant: "primary",
      },
    ],
  },
];

const SAMPLE_RESPONSES = [
  "Gracias por tu mensaje. Esta es una respuesta de ejemplo. Pronto estaré conectado con IA para brindarte respuestas más inteligentes.",
  "¡Excelente pregunta! Estoy aquí para ayudarte con cualquier duda sobre FusionCRM.",
  "Entiendo tu consulta. En el futuro podré brindarte respuestas más específicas y útiles.",
  "Perfecto, estoy procesando tu solicitud. Pronto tendré capacidades de IA más avanzadas.",
];

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [awaitingGptResponse, setAwaitingGptResponse] = useState(false);
  const { contextData, sendContextualMessage } = useChatContext();

  const addMessage = useCallback(
    (content: string, sender: "user" | "assistant", buttons?: any[]) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        sender,
        timestamp: new Date(),
        buttons,
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    },
    []
  );

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
                ]
              );
              setIsTyping(false);
              return;
            }

            const gptResponse = await GPTService.sendMessage({
              message: content,
              context: contextData || undefined,
            });

            addMessage(gptResponse.content, "assistant", [
              {
                id: "gpt-follow-up",
                text: "Preguntar algo más a GPT",
                type: "gpt",
                variant: "primary",
              },
            ]);
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
              ]
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

            addMessage(responseContent, "assistant", buttons);
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

    // Agregar mensaje de confirmación después de un breve delay
    setTimeout(() => {
      addMessage(
        "Conversación reiniciada. ¡Hola de nuevo! ¿En qué puedo ayudarte?",
        "assistant",
        [
          {
            id: "restart-1",
            text: "Ver tutoriales",
            type: "action",
            variant: "secondary",
          },
          {
            id: "restart-2",
            text: "Mejores prácticas",
            type: "action",
            variant: "secondary",
          },
          {
            id: "restart-3",
            text: "Preguntar a GPT",
            type: "gpt",
            variant: "primary",
          },
        ]
      );
    }, 500);
  }, [addMessage]);

  const handleButtonClick = useCallback(
    (button: any) => {
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
          handleActionButton(button);
        }
      } else if (button.type === "suggestion") {
        // Tratar como mensaje normal
        sendMessage(button.text);
      }
    },
    [addMessage]
  );

  const handleActionButton = useCallback(
    (button: any) => {
      setIsTyping(true);

      setTimeout(() => {
        let responseContent = "";

        // Respuestas específicas por ID de botón
        switch (button.id) {
          case "deals-stats-1":
            responseContent =
              "Aquí tienes el desglose por etapa: Prospecto (40%), Negociación (30%), Propuesta (20%), Cierre (10%)";
            break;
          case "deals-stats-2":
            responseContent =
              "Los deals de mayor valor están en la etapa de negociación. El promedio es $15,000 por deal.";
            break;
          case "deals-default-1":
            responseContent =
              "Estadísticas generales: Tasa de conversión 15%, tiempo promedio de cierre 30 días, valor promedio $8,500.";
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
    [addMessage]
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
  };
};
