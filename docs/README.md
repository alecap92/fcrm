# 📚 Documentación Frontend - FUSIONCOL

## 🎯 Bienvenido a la Documentación

Esta es la documentación completa del frontend de FUSIONCOL. Aquí encontrarás toda la información necesaria para entender, desarrollar y mantener la aplicación React.

## 📖 Índice de Contenidos

### 🧩 **Componentes**

#### Componentes del Sistema

- [**Editor de Workflows**](./components/workflow-editor.md) - Documentación completa del editor visual de automatizaciones
- [**Sistema de Chat**](./components/chat-system.md) - Componentes para la gestión de conversaciones
- [**Componentes UI Base**](./components/ui-components.md) - Biblioteca de componentes reutilizables
- [**Componentes de Formularios**](./components/forms.md) - Formularios y validación

### ⚡ **Funcionalidades**

#### Características Principales

- [**Sistema de Notificaciones**](./features/notifications.md) - Notificaciones en tiempo real con sonido y título
- [**Drag & Drop en Workflows**](./features/drag-drop-improvements.md) - Mejoras en la funcionalidad de arrastrar y soltar
- [**Eliminación de Elementos**](./features/delete-functionality.md) - Sistema de eliminación de nodos y conexiones
- [**Gestión de Estado**](./features/state-management.md) - Arquitectura y patrones de estado
- [**Módulo de Emails**](./features/email-module.md) - Configuración de cuentas y gestión de correos

### 📖 **Guías de Desarrollo**

#### Para Desarrolladores

- [**Guía de Componentes**](./guides/component-development.md) - Convenciones y mejores prácticas para componentes
- [**Gestión de Estado**](./guides/state-management.md) - Patrones y arquitectura de estado
- [**Testing**](./guides/testing.md) - Estrategias y herramientas de testing
- [**Convenciones de Código**](./guides/code-conventions.md) - Estándares de código y estilo
- [**Deployment**](./guides/deployment.md) - Variables de entorno y despliegue

### 🔌 **API y Servicios**

#### Integración y Comunicación

- [**Servicios de API**](./api/api-services.md) - Servicios para comunicación con el backend
- [**WebSocket Integration**](./api/websocket.md) - Comunicación en tiempo real
- [**Autenticación**](./api/authentication.md) - Sistema de autenticación y autorización

## 🚀 Inicio Rápido

### Para Nuevos Desarrolladores

1. **Configuración Inicial**

   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

2. **Documentación Esencial**

   - Lee el [README principal](../README.md) del frontend
   - Revisa la [Guía de Componentes](./guides/component-development.md)
   - Familiarízate con la [Gestión de Estado](./features/state-management.md)

3. **Primer Componente**
   - Sigue la [Guía de Desarrollo de Componentes](./guides/component-development.md)
   - Usa los [Componentes UI Base](./components/ui-components.md) como referencia

### Para Contribuidores

1. **Antes de Contribuir**

   - Lee las [Convenciones de Código](./guides/code-conventions.md)
   - Revisa la [Guía de Testing](./guides/testing.md)
   - Entiende la [Arquitectura de Estado](./features/state-management.md)

2. **Flujo de Desarrollo**
   - Crea una rama desde `develop`
   - Desarrolla siguiendo las guías
   - Escribe tests y documentación
   - Crea PR con descripción detallada

## 🎯 Contextos Principales

### AutomationContext

- **Ubicación**: `src/contexts/AutomationContext.tsx`
- **Documentación**: [AutomationContext README](../src/contexts/README.md)
- **Propósito**: Gestión completa de automatizaciones y workflows

### ChatContext

- **Ubicación**: `src/contexts/ChatContext.tsx`
- **Documentación**: [Chat Context](./api/chat-context.md)
- **Propósito**: Gestión de conversaciones y mensajes en tiempo real

### AuthContext

- **Ubicación**: `src/contexts/AuthContext.tsx`
- **Documentación**: [Auth Context](./api/auth-context.md)
- **Propósito**: Autenticación y autorización de usuarios

## 🛠️ Herramientas y Tecnologías

### Stack Principal

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos

### Librerías Especializadas

- **ReactFlow** - Editor visual de workflows
- **Socket.io Client** - WebSockets para tiempo real
- **React Hook Form** - Manejo de formularios
- **React Testing Library** - Testing de componentes

### Herramientas de Desarrollo

- **Storybook** - Desarrollo y documentación de componentes
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Jest** - Testing framework

## 📁 Estructura de Archivos

```
frontend/
├── src/
│   ├── components/        # Componentes organizados por dominio
│   │   ├── ui/           # Componentes base reutilizables
│   │   ├── chat/         # Componentes del sistema de chat
│   │   ├── workflow/     # Componentes del editor de workflows
│   │   └── common/       # Componentes comunes
│   ├── contexts/         # Contextos de React
│   ├── hooks/            # Hooks personalizados
│   ├── pages/            # Páginas principales
│   ├── services/         # Servicios y API calls
│   ├── types/            # Definiciones de TypeScript
│   ├── utils/            # Utilidades y helpers
│   └── styles/           # Estilos globales
├── docs/                 # Esta documentación
│   ├── components/       # Docs de componentes
│   ├── features/         # Docs de funcionalidades
│   ├── guides/           # Guías de desarrollo
│   └── api/              # Docs de API frontend
└── public/               # Archivos estáticos
```

## 🔍 Búsqueda Rápida

### Por Funcionalidad

- **Automatizaciones**: [WorkflowEditor](./components/workflow-editor.md), [AutomationContext](../src/contexts/README.md)
- **Chat**: [Sistema de Chat](./components/chat-system.md), [Notificaciones](./features/notifications.md)
- **UI/UX**: [Componentes UI](./components/ui-components.md), [Guía de Componentes](./guides/component-development.md)
- **Estado**: [Gestión de Estado](./features/state-management.md), [Contextos](./api/)

### Por Tipo de Desarrollo

- **Nuevo Componente**: [Guía de Componentes](./guides/component-development.md)
- **Nueva Funcionalidad**: [Arquitectura](./features/state-management.md)
- **Testing**: [Guía de Testing](./guides/testing.md)
- **Debugging**: [Troubleshooting](../README.md#-troubleshooting)

## 🆘 Soporte y Ayuda

### Recursos Internos

- **README Principal**: [Frontend README](../README.md)
- **Contextos**: [Documentación de Contextos](../src/contexts/)
- **Componentes**: [Storybook Local](http://localhost:6006) (cuando esté ejecutándose)

### Recursos Externos

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [ReactFlow Documentation](https://reactflow.dev/)

### Contacto

- 🐛 **Issues**: GitHub Issues para reportar bugs
- 💬 **Discusiones**: GitHub Discussions para preguntas
- 📖 **Wiki**: Documentación extendida en el Wiki del proyecto

## 📊 Estado de la Documentación

### ✅ Completado

- [x] Documentación de componentes principales
- [x] Guías de desarrollo
- [x] Documentación de funcionalidades core
- [x] Estructura y organización
- [x] Documentación de deployment

### 🚧 En Progreso

- [ ] Documentación de API services
- [ ] Guías de testing específicas

### 📋 Pendiente

- [ ] Storybook stories para todos los componentes
- [ ] Documentación de accesibilidad
- [ ] Guías de performance
- [ ] Documentación de internacionalización

---

**¿Necesitas ayuda?** Revisa esta documentación o contacta al equipo de desarrollo.

**¿Encontraste un error?** Crea un issue o envía un PR con la corrección.

**¿Quieres contribuir?** Lee las guías de desarrollo y únete al proyecto.
