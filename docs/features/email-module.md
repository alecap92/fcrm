# Módulo de Correos

## 📋 Descripción

El módulo de correos permite a los usuarios configurar su cuenta de email y gestionar mensajes desde la aplicación. Está compuesto por un servicio de API, un contexto de React para el estado global y una serie de componentes para la interfaz.

## 🏗️ Arquitectura y Servicios

El archivo [`src/services/emailService.ts`](../../src/services/emailService.ts) centraliza todas las llamadas a la API. Utiliza un cliente Axios con interceptor para incluir el token de autenticación de forma automática:

```typescript
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/email`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

El servicio expone métodos como `sendEmail` que construyen un `FormData` con los campos y adjuntos del correo:

```typescript
async sendEmail(emailData: EmailCompose): Promise<any> {
  const formData = new FormData();
  formData.append("to", JSON.stringify(emailData.to));
  if (emailData.cc?.length) formData.append("cc", JSON.stringify(emailData.cc));
  if (emailData.bcc?.length) formData.append("bcc", JSON.stringify(emailData.bcc));
  formData.append("subject", emailData.subject);
  formData.append("content", emailData.content);
  // ...adjuntos y cabeceras
  const response = await apiClient.post("/send", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
```

## 📦 Contexto de Estado

`src/contexts/EmailContext.tsx` maneja el estado global de correos. Allí se definen acciones para cargar bandejas, enviar mensajes y moverlos entre carpetas. Todas las operaciones están envueltas en `try/catch` y utilizan `toast` para notificar errores o acciones exitosas:

```typescript
const sendEmail = async (emailData: EmailCompose) => {
  try {
    await emailsService.emails.sendEmail(emailData);
    dispatch({ type: "SET_COMPOSING", payload: false });
    if (state.currentFolder === "SENT") {
      loadEmails();
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Lo maneja el componente
  }
};
```

## 🖥️ Componentes Principales

- **EmailClient**: interfaz principal que muestra la lista de correos y el visor.
- **ComposeEmail** y **BaseEmailComposer**: componentes para redactar mensajes.
- **EmailView**: permite leer un correo, responder o reenviar.
- **EmailSetup**: asistente inicial de configuración de cuenta.

Cada componente utiliza el contexto para realizar operaciones y muestra mensajes de error con `toast` cuando algo falla.

## 📁 Estructura de Archivos

```
frontend/src/
├── components/email/        # Componentes de interfaz
├── contexts/EmailContext.tsx
└── services/emailService.ts
```

Con esta estructura se logra una separación clara entre lógica de negocio, estado global y componentes de presentación.
