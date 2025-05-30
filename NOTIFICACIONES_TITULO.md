# Notificaciones en el Título de la Página

## Descripción

Esta funcionalidad permite mostrar notificaciones en el título de la página (tab del navegador) cuando llegan mensajes nuevos, alternando entre el mensaje de notificación y el título original de la aplicación.

## Características

### 🔔 Notificación Visual

- **Parpadeo del título**: El título alterna entre "💬 [Nombre] envió un nuevo mensaje" y "FusionCRM"
- **Duración**: 15 segundos de parpadeo por defecto
- **Intervalo**: Cambia cada 2 segundos
- **Emoji**: Incluye emoji de mensaje (💬) para mayor visibilidad

### 🎯 Activación Automática

- Se activa cuando llega un mensaje nuevo de una conversación que **NO** está actualmente abierta
- Funciona con eventos de socket: `new_message`, `whatsapp_message`, y `newNotification`
- Detecta automáticamente el nombre del remitente desde:
  1. Campo `possibleName` del mensaje
  2. Título de la conversación existente
  3. Número de teléfono formateado
  4. "Contacto" como fallback

### 🔄 Restauración Automática

- **Al hacer foco**: Cuando el usuario hace clic en la tab o ventana
- **Al cambiar visibilidad**: Cuando la página se vuelve visible
- **Al abrir conversación**: Cuando el usuario abre una conversación
- **Por tiempo**: Después de 15 segundos automáticamente

## Implementación Técnica

### Hook Principal: `usePageTitle`

```typescript
const { showNewMessageNotification, restoreTitle } = usePageTitle({
  defaultTitle: "FusionCRM",
  blinkInterval: 2000,
  blinkDuration: 15000,
});
```

### Integración en ChatContext

```typescript
// Mostrar notificación cuando llega mensaje nuevo
if (
  newMessage.direction === "incoming" &&
  newMessage.conversation !== currentChatId
) {
  const senderName =
    newMessage.possibleName ||
    conversations.find((conv) => conv.id === newMessage.conversation)?.title ||
    newMessage.from ||
    "Contacto";
  showNewMessageNotification(senderName);
}
```

### Eventos de Socket Soportados

1. **`new_message`**: Mensajes directos
2. **`whatsapp_message`**: Mensajes de WhatsApp
3. **`newNotification`**: Notificaciones generales de WhatsApp

## Configuración

### Opciones del Hook

```typescript
interface UsePageTitleOptions {
  defaultTitle?: string; // Título por defecto (default: "FusionCRM")
  blinkInterval?: number; // Intervalo de parpadeo en ms (default: 2000)
  blinkDuration?: number; // Duración total en ms (default: 10000)
}
```

### Personalización

Para cambiar la configuración, modifica los parámetros en `ChatContext.tsx`:

```typescript
const { showNewMessageNotification, restoreTitle } = usePageTitle({
  defaultTitle: "Tu App",
  blinkInterval: 1500, // Parpadeo más rápido
  blinkDuration: 20000, // Duración más larga
});
```

## Pruebas

### Botones de Prueba (Solo en Desarrollo)

En el `ChatModal` hay dos botones de prueba:

1. **"Probar Notificación"**: Simula notificación básica
2. **"WhatsApp Test"**: Simula evento `newNotification` de WhatsApp

### Prueba Manual

1. Abre una conversación
2. Desde otro dispositivo/número, envía un mensaje a un contacto diferente
3. Observa cómo el título de la página parpadea
4. Haz clic en la tab para restaurar el título

## Estructura de Archivos

```
frontend/src/
├── hooks/
│   └── usePageTitle.ts          # Hook principal
├── contexts/
│   └── ChatContext.tsx          # Integración con eventos de socket
└── components/chat/modal/
    └── ChatModal.tsx            # Botones de prueba (temporal)
```

## Eventos de Socket Esperados

### newNotification (WhatsApp)

```javascript
{
  contact: "573132925094",
  message: {
    message: "Hola, ¿cómo estás?",
    timestamp: "2025-05-29T21:22:07.000Z"
  },
  title: "Nuevo mensaje de WhatsApp: Hola, ¿cómo estás?",
  type: "whatsapp"
}
```

### new_message / whatsapp_message

```javascript
{
  _id: "message_id",
  conversation: "conversation_id",
  direction: "incoming",
  from: "573132925094",
  possibleName: "Juan Pérez",
  message: "Hola",
  // ... otros campos
}
```

## Notas de Desarrollo

- ✅ Funciona en producción
- ✅ Compatible con todos los navegadores modernos
- ✅ No interfiere con otras funcionalidades
- ✅ Limpieza automática de timeouts
- ✅ Manejo de errores robusto

## Próximas Mejoras

- [ ] Contador de mensajes no leídos en el título
- [ ] Sonido de notificación opcional
- [ ] Configuración por usuario
- [ ] Notificaciones del sistema (browser notifications)
