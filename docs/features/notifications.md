# Notificaciones en el Título de la Página y Sonido

## Descripción

Esta funcionalidad permite mostrar notificaciones en el título de la página (tab del navegador) y reproducir sonidos de notificación cuando llegan mensajes nuevos, alternando entre el mensaje de notificación y el título original de la aplicación.

## Características

### 🔔 Notificación Visual

- **Parpadeo del título**: El título alterna entre "💬 [Nombre] envió un nuevo mensaje" y "FusionCRM"
- **Duración**: 15 segundos de parpadeo por defecto
- **Intervalo**: Cambia cada 2 segundos
- **Emoji**: Incluye emoji de mensaje (💬) para mayor visibilidad

### 🔊 Notificación Sonora

- **Sonido automático**: Se reproduce un sonido cuando llega un mensaje nuevo
- **Fallback inteligente**: Si no se encuentra el archivo de audio, genera un sonido programáticamente
- **Volumen configurable**: Volumen ajustable (por defecto 60%)
- **Compatibilidad**: Funciona en todos los navegadores modernos
- **Respeta permisos**: Se adapta a las políticas de autoplay del navegador

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
const { showNewMessageNotification, restoreTitle, testSound } = usePageTitle({
  defaultTitle: "FusionCRM",
  blinkInterval: 2000,
  blinkDuration: 15000,
  soundEnabled: true,
  soundVolume: 0.6,
});
```

### Hook de Sonido: `useNotificationSound`

```typescript
const { playNotificationSound, playCustomSound, testSound } =
  useNotificationSound({
    soundUrl: "/sounds/notification.mp3",
    volume: 0.5,
    enabled: true,
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
  showNewMessageNotification(senderName); // Incluye sonido automáticamente
}
```

### Eventos de Socket Soportados

1. **`new_message`**: Mensajes directos
2. **`whatsapp_message`**: Mensajes de WhatsApp
3. **`newNotification`**: Notificaciones generales de WhatsApp

## Configuración

### Opciones del Hook usePageTitle

```typescript
interface UsePageTitleOptions {
  defaultTitle?: string; // Título por defecto (default: "FusionCRM")
  blinkInterval?: number; // Intervalo de parpadeo en ms (default: 2000)
  blinkDuration?: number; // Duración total en ms (default: 10000)
  soundEnabled?: boolean; // Habilitar sonidos (default: true)
  soundUrl?: string; // URL del archivo de sonido (default: "/sounds/notification.mp3")
  soundVolume?: number; // Volumen del sonido (default: 0.5)
}
```

### Opciones del Hook useNotificationSound

```typescript
interface UseNotificationSoundOptions {
  soundUrl?: string; // URL del archivo de sonido
  volume?: number; // Volumen (0.0 - 1.0)
  enabled?: boolean; // Habilitar/deshabilitar sonidos
}
```

### Personalización

Para cambiar la configuración, modifica los parámetros en `ChatContext.tsx`:

```typescript
const { showNewMessageNotification, restoreTitle, testSound } = usePageTitle({
  defaultTitle: "Tu App",
  blinkInterval: 1500, // Parpadeo más rápido
  blinkDuration: 20000, // Duración más larga
  soundEnabled: true, // Habilitar sonidos
  soundVolume: 0.8, // Volumen más alto
});
```

## Pruebas

### Botones de Prueba (Solo en Desarrollo)

En el `ChatModal` hay tres botones de prueba:

1. **"Probar Notificación"**: Simula notificación básica con título y sonido
2. **"WhatsApp Test"**: Simula evento `newNotification` de WhatsApp
3. **"🔊 Sonido"**: Prueba solo el sonido de notificación

### Prueba Manual

1. Abre una conversación
2. Desde otro dispositivo/número, envía un mensaje a un contacto diferente
3. Observa cómo el título de la página parpadea y escucha el sonido
4. Haz clic en la tab para restaurar el título

## Estructura de Archivos

```
frontend/src/
├── hooks/
│   ├── usePageTitle.ts          # Hook principal (título + sonido)
│   └── useNotificationSound.ts  # Hook específico para sonidos
├── contexts/
│   └── ChatContext.tsx          # Integración con eventos de socket
├── components/chat/modal/
│   └── ChatModal.tsx            # Botones de prueba (temporal)
└── public/sounds/
    └── notification.mp3         # Archivo de sonido (opcional)
```

## Sonidos de Notificación

### Archivo de Audio (Opcional)

Puedes colocar un archivo de sonido en `/public/sounds/notification.mp3`. Formatos soportados:

- MP3 (recomendado)
- WAV
- OGG
- M4A

### Sonido Generado Programáticamente

Si no se encuentra el archivo de audio, el sistema genera automáticamente un sonido usando Web Audio API:

- Tono de 800Hz que baja a 600Hz
- Duración de 200ms
- Fade in/out suave
- Compatible con todos los navegadores modernos

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

## Consideraciones del Navegador

### Políticas de Autoplay

Los navegadores modernos requieren interacción del usuario antes de reproducir audio:

- **Chrome**: Requiere interacción del usuario
- **Firefox**: Permite autoplay con volumen bajo
- **Safari**: Requiere interacción del usuario
- **Edge**: Requiere interacción del usuario

### Solución Implementada

- El sonido se reproduce automáticamente después de que el usuario haya interactuado con la página
- Si falla el autoplay, se muestra un mensaje en la consola (no afecta la funcionalidad)
- El sonido generado programáticamente tiene mejor compatibilidad

## Notas de Desarrollo

- ✅ Funciona en producción
- ✅ Compatible con todos los navegadores modernos
- ✅ No interfiere con otras funcionalidades
- ✅ Limpieza automática de timeouts y recursos de audio
- ✅ Manejo de errores robusto
- ✅ Fallback automático para sonidos
- ✅ Respeta las políticas de autoplay del navegador

## Próximas Mejoras

- [ ] Contador de mensajes no leídos en el título
- [x] Sonido de notificación ✅
- [ ] Configuración por usuario para habilitar/deshabilitar sonidos
- [ ] Notificaciones del sistema (browser notifications)
- [ ] Diferentes sonidos para diferentes tipos de mensajes
- [ ] Configuración de volumen por usuario
