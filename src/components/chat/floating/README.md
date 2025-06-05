# Chat Flotante Contextual - FusionCRM

## Descripción

El componente de chat flotante es un asistente virtual inteligente que aparece en todas las vistas de la aplicación FusionCRM. Proporciona respuestas contextuales basadas en los datos y módulo actual.

## Características Principales

- **Flotante**: Posicionado en esquina inferior derecha
- **Contextual**: Respuestas inteligentes basadas en el módulo actual
- **Sistema de Botones**: Interfaz guiada con botones de acción específicos
- **Input Condicional**: Campo de texto solo aparece cuando se selecciona "Preguntar a GPT"
- **Control de API**: Uso controlado de OpenAI GPT solo cuando es necesario
- **Respuestas Hardcodeadas**: Sistema de respuestas predefinidas para casos comunes
- **Minimizable/Expandible**: Interfaz adaptativa
- **Indicador de Escritura**: Feedback visual durante respuestas

## Arquitectura del Sistema

### Componentes UI

- `FloatingChat`: Componente principal con estado minimizado/expandido
- `ChatWindow`: Ventana expandida con toda la funcionalidad
- `ChatHeader`: Header con título, botón limpiar conversación y botón cerrar
- `ChatMessage`: Renderizado de mensajes individuales con botones
- `ChatInput`: Input condicional para enviar mensajes (solo cuando se requiere)
- `ChatButtons`: Botones de acción en mensajes del asistente
- `ChatSuggestions`: Muestra sugerencias contextuales (legacy)
- `TypingIndicator`: Animación de escritura

### Lógica y Estado

- `ChatContext`: Contexto global para manejo de datos contextuales
- `useChatLogic`: Hook para lógica del chat, mensajes y detección de intenciones
- `useChatModule`: Hook para integración en módulos específicos
- `ChatResponseService`: Servicio para generar respuestas contextuales
- `GPTService`: Servicio para llamadas controladas a OpenAI GPT
- `KeywordDetectionService`: Servicio para detectar intenciones y palabras clave

## Integración en Módulos

### Uso Básico

```tsx
import { useChatModule } from "../components/chat/floating";

function DealsPage() {
  const chatModule = useChatModule("deals");

  useEffect(() => {
    // Actualizar contexto cuando cambien los datos
    chatModule.updateChatContext(deals, {
      currentPage: "deals",
      totalCount: deals.length,
    });

    // Agregar sugerencias dinámicas
    if (pendingDeals.length > 0) {
      chatModule.sendSuggestion("¿Qué deals necesitan seguimiento?");
    }
  }, [deals]);
}
```

### Módulos Soportados

- `deals`: Gestión de oportunidades de venta
- `contacts`: Gestión de contactos y clientes
- `conversations`: Comunicaciones y chat
- `quotes`: Cotizaciones y propuestas
- `invoices`: Facturación
- `products`: Catálogo de productos
- `projects`: Gestión de proyectos
- `analytics`: Reportes y análisis
- `automations`: Automatizaciones
- `general`: Funcionalidad general

## Sistema de Respuestas Contextuales

### Respuestas por Módulo

Cada módulo tiene respuestas específicas basadas en:

- **Datos actuales**: Cantidad, estado, filtros aplicados
- **Palabras clave**: Análisis del mensaje del usuario
- **Contexto**: Página actual y metadatos

### Ejemplos de Respuestas

- **Deals**: Estadísticas, consejos de conversión, seguimiento
- **Contacts**: Segmentación, campañas, actividad
- **Analytics**: Interpretación de datos, tendencias, recomendaciones

## Sugerencias Inteligentes

### Generación Automática

- Se generan basadas en el módulo actual
- Consideran el estado de los datos
- Incluyen acciones ejecutables

### Sugerencias Personalizadas

```tsx
chatModule.sendSuggestion("Texto de la sugerencia", () => {
  // Acción personalizada
  console.log("Ejecutando acción");
});
```

## Configuración y Personalización

### Colores y Estilos

- Usa el sistema de diseño de Tailwind CSS
- Colores principales: `bg-blue-600`, `text-white`
- Consistente con el branding de FusionCRM

### Respuestas Personalizadas

Las respuestas se pueden personalizar editando `ChatResponseService.ts`:

- Agregar nuevos módulos
- Modificar respuestas existentes
- Incluir lógica específica del negocio

## Roadmap Futuro

### Integración con IA

- Conexión con OpenAI/Claude para respuestas más inteligentes
- Análisis de datos en tiempo real
- Generación de insights automáticos

### Funcionalidades Avanzadas

- Historial de conversaciones persistente
- Tutoriales interactivos paso a paso
- Notificaciones proactivas
- Integración con automatizaciones

### Mejoras UX

- Modo oscuro
- Personalización de posición
- Atajos de teclado
- Búsqueda en historial

## Sistema de Botones Inteligentes

### Tipos de Botones

- **Acción (`action`)**: Ejecuta respuestas predefinidas específicas
- **GPT (`gpt`)**: Habilita el input de texto para consultas a OpenAI
- **Sugerencia (`suggestion`)**: Envía mensaje predefinido como usuario

### Flujo de Interacción

1. **Usuario ve botones** en lugar de input de texto por defecto
2. **Selecciona acción** específica o "Preguntar a GPT"
3. **Si es acción**: Respuesta inmediata predefinida
4. **Si es GPT**: Se habilita input para escribir pregunta personalizada
5. **Control de costos**: API solo se usa cuando es necesario

### Variantes de Botones

```tsx
{
  id: 'unique-id',
  text: 'Texto del botón',
  type: 'action' | 'gpt' | 'suggestion',
  variant: 'primary' | 'secondary' | 'outline',
  action?: () => void // Función opcional para acciones personalizadas
}
```

### Ventajas del Sistema

- **Control de costos**: GPT solo se usa cuando el usuario lo solicita explícitamente
- **Experiencia guiada**: Botones sugieren acciones relevantes
- **Respuestas rápidas**: Acciones predefinidas son instantáneas
- **Flexibilidad**: Opción de GPT para consultas complejas

## Control de API de OpenAI

### Cuándo se Usa GPT

- Solo cuando el usuario hace clic en "Preguntar a GPT"
- Después de escribir una pregunta específica
- Con contexto completo del módulo actual

### Cuándo NO se Usa GPT

- Respuestas predefinidas disponibles
- Acciones simples (estadísticas, tutoriales)
- Navegación básica del CRM

### Estimación de Costos

El sistema incluye métodos para estimar tokens antes de enviar:

```tsx
const estimatedTokens = GPTService.estimateTokens(message, context);
const shouldUse = GPTService.shouldUseGPT(message, context);
```

## Integración Real con OpenAI

### Configuración

El sistema ahora está conectado con la API real de OpenAI a través del backend de FusionCRM:

- **Endpoint**: `/api/chat/gpt`
- **Autenticación**: Token de usuario automático
- **Modelo**: Configurable (por defecto GPT-4o-mini)

### Prompts Contextuales

El sistema construye prompts inteligentes basados en:

```tsx
// Ejemplo de prompt generado automáticamente
`Eres un asistente experto en CRM para FusionCRM.

Contexto actual:
- Módulo: contacts
- Página: contact-details
- Total de registros: 3

Datos del contacto actual:
- Nombre: Juan Pérez
- Empresa: Empresa ABC
- Total de deals: 3
- Valor total en deals: $35,000
- Valor promedio por deal: $11,666.67`;
```

### Ejemplo de Uso en ContactDetails

```tsx
// 1. Integrar el hook
const chatModule = useChatModule("contacts");

// 2. Actualizar contexto con datos del contacto
useEffect(() => {
  const contactDataForChat = {
    ...contactDetails,
    deals,
    leadScore,
    dailyMetrics,
  };

  chatModule.updateChatContext(contactDataForChat, {
    currentPage: "contact-details",
    totalCount: deals.length,
  });
}, [contactDetails, deals]);
```

### Funcionalidades Implementadas

#### 1. Cálculo de Valor Promedio

- **Botón**: "Calcular valor promedio" → Respuesta inmediata con cálculo local
- **GPT**: "¿Cuál es el valor promedio?" → Análisis detallado con IA

#### 2. Análisis del Contacto

- **Botón**: "Análisis del contacto" → Resumen de actividad predefinido
- **GPT**: Análisis profundo con recomendaciones personalizadas

#### 3. Respuestas Híbridas

- **Cálculos simples**: Se hacen localmente (suma, promedio, conteo)
- **Análisis complejos**: Se envían a GPT con contexto completo
- **Fallback**: Si GPT falla, respuestas predefinidas inteligentes

### Ejemplos de Preguntas para GPT

En ContactDetails puedes preguntar:

- "¿Qué estrategias recomiendas para este cliente de alto valor?"
- "¿Cómo puedo aumentar el valor promedio de compra?"
- "¿Qué patrones ves en los deals de este contacto?"
- "¿Cuándo es el mejor momento para hacer follow-up?"
- "¿Cómo convertir este lead en cliente?"

### Control de Costos Avanzado

```tsx
// Estimación de tokens antes de enviar
const tokens = GPTService.estimateTokens(message, context);

// Verificación si debe usar GPT
const shouldUseGPT = GPTService.shouldUseGPT(message);

// Respuestas de fallback inteligentes
if (message.includes("valor promedio") && context?.data?.deals) {
  // Calcular localmente sin usar API
  return calculateAverageLocally(context.data.deals);
}
```

### Manejo de Errores

- **Error de API**: Fallback a respuestas predefinidas
- **Sin conexión**: Respuestas locales basadas en contexto
- **Token inválido**: Mensaje de reautenticación
- **Rate limiting**: Mensaje de espera con retry automático

### Gestión de Conversación

#### Limpiar Conversación

- **Botón de reinicio**: Ícono de RotateCcw en el header
- **Confirmación**: Diálogo de confirmación antes de limpiar
- **Reset completo**: Limpia mensajes, estado de input y flags de GPT
- **Mensaje de bienvenida**: Muestra mensaje de reinicio con botones iniciales

```tsx
// La función clearMessages resetea todo el estado
const clearMessages = useCallback(() => {
  setMessages(INITIAL_MESSAGES);
  setIsTyping(false);
  setShowTextInput(false);
  setAwaitingGptResponse(false);

  // Mensaje de confirmación después del reset
  setTimeout(() => {
    addMessage("Conversación reiniciada. ¡Hola de nuevo! ¿En qué puedo ayudarte?", "assistant", [...]);
  }, 500);
}, [addMessage]);
```

## Sistema de Detección de Palabras Clave

### Conversación Natural

El chat ahora "escucha" palabras clave y responde automáticamente:

```tsx
// Ejemplos de activación automática
Usuario: "preguntar a gpt sobre ventas" → Activa GPT automáticamente
Usuario: "valor promedio" → Calcula sin usar API
Usuario: "menú" → Muestra opciones principales
Usuario: "cómo crear deal" → Respuesta tutorial específica
```

### Palabras Clave Principales

- **GPT**: "preguntar a gpt", "análisis profundo", "recomendación personalizada"
- **Menú**: "menú", "opciones", "qué puedes hacer"
- **Tutoriales**: "cómo", "tutorial", "paso a paso"
- **Estadísticas**: "estadísticas", "análisis", "métricas"
- **Valor Promedio**: "valor promedio", "promedio", "cuánto gasta"

### Ventajas

- **Conversación más natural**: No depende solo de botones
- **Activación inteligente**: GPT se activa automáticamente cuando se necesita
- **Respuestas contextuales**: Detecta intenciones específicas
- **Control del usuario**: Puede solicitar menú o GPT escribiendo

## Archivos de Ejemplo

- `examples/DealsIntegration.example.tsx`: Integración en módulo de deals
- `examples/ContactDetailsIntegration.example.tsx`: Ejemplo completo con ContactDetails y GPT real
- `examples/KeywordDetectionExample.md`: Ejemplos del sistema de palabras clave
