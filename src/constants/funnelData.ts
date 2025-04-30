import { FunnelSection } from "../types/strategy";

export const initialFunnelData: FunnelSection[] = [
  {
    id: "tofu",
    title: "Top of Funnel",
    leadCount: 45678,
    color: "bg-blue-500",
    content: {
      title: "Etapa de Descubrimiento",
      description:
        "Usuarios descubriendo tu marca y aprendiendo sobre tus ofertas",
      channels: [
        {
          name: "SEO",

          completionPercentage: 0,
          description:
            "Optimización para aparecer en los motores de búsqueda como Google, que incrementa visibilidad orgánica y garantiza una estrategia a largo plazo.",
          keyActivities: [
            {
              name: "Investigación de palabras clave",
              completed: false,
            },
            {
              name: "Estrategia de posicionamiento.",
              completed: false,
            },

            { name: "Optimización técnica del sitio", completed: false },
            { name: "Link building con sitios de autoridad", completed: false },
            {
              name: "Desarrollo de páginas pilar y contenido cluster",
              completed: false,
            },
            {
              name: "Indexación en Search Console",
              completed: false,
            },
            {
              name: "Posicionamiento en Google My Business",
              completed: false,
            },
            {
              name: "Reviews en google maps",
              completed: false,
            },
            {
              name: "Posicionamiento en herramientas de IA",
              completed: false,
            },
            {
              name: "Optimizacion de contenido enriquecido",
              completed: false,
            },
            {
              name: "Optimizacion de Imagenes (Alt text, etc)",
              completed: false,
            },
          ],
        },
        {
          name: "Social Media",

          completionPercentage: 0,
          description:
            "Canales para construir presencia y conectar con audiencias que aún no conocen tu marca. Enfoque en contenido educativo, viral y de valor sin venta directa. Ej: Instagram, LinkedIn, TikTok, Youtube,Facebook, etc.",
          keyActivities: [
            {
              name: "Estrategia de contenido y elección de canales",
              completed: false,
            },
            {
              name: "Cronograma de publicaciones",
              completed: false,
            },
            {
              name: "Creación de infografías y contenido visual shareablee",
              completed: false,
            },
            {
              name: "Participación en conversaciones relevantes del sector (Reddit, grupos de Facebook, etc.)",
              completed: false,
            },
            {
              name: "Colaboraciones con creadores de contenido",
              completed: false,
            },
          ],
        },
        {
          name: "Content Marketing",

          completionPercentage: 0,
          description:
            "Creación de contenidos informativos (blogs, guías, infografías) que educan al usuario sobre problemas que tu producto/servicio puede resolver.",
          keyActivities: [
            {
              name: "Desarrollo de blogs educativos sobre la industria",
              completed: false,
            },
            {
              name: "Creación de guías descargables gratuitas",
              completed: false,
            },
            {
              name: "Producción de podcasts, infografías o videos informativos",
              completed: false,
            },
            {
              name: "Elaboración de infografías sobre tendencias",
              completed: false,
            },
            {
              name: "Informacion relevante de la industria (Ej: Noticias, Leyes, etc.)",
              completed: false,
            },
            {
              name: "Guest Posting",
              completed: false,
            },
          ],
        },
        {
          name: "Publicidad Digital",

          completionPercentage: 0,
          description:
            "Anuncios para generar reconocimiento de marca y alcanzar nuevas audiencias. Enfoque en awareness y posicionamiento. Ej: Google Ads, Facebook Ads, LinkedIn Ads, etc.",
          keyActivities: [
            {
              name: "Creación de Estrategia de Publicidad",
              completed: false,
            },
            {
              name: "Segmentación por intereses y comportamientos",
              completed: false,
            },
            {
              name: "Anuncios nativos en plataformas de contenido",
              completed: false,
            },
            {
              name: "Desarrollo de creatividades para distintos formatos",
              completed: false,
            },
            {
              name: "Análisis y optimización de reach y frecuencia",
              completed: false,
            },
          ],
        },
        {
          name: "Estrategia de medios de comunicación",

          completionPercentage: 0,
          description:
            "Estrategias para obtener menciones en medios online o offline y generar credibilidad externa a través de terceros reconocidos.",
          keyActivities: [
            {
              name: "Desarrollo de notas de prensa educativas",
              completed: false,
            },
            {
              name: "Participación como fuente experta en artículos",
              completed: false,
            },
            {
              name: "Creación de estudios e investigaciones compartibles",
              completed: false,
            },
            {
              name: "Establecimiento de relaciones con periodistas clave",
              completed: false,
            },
            {
              name: "Monitoreo de oportunidades de prensa (HARO, etc.)",
              completed: false,
            },
          ],
        },
        {
          name: "Asistencia a eventos",

          completionPercentage: 0,
          description:
            "Asistir a eventos para generar leads y construir relaciones",
          keyActivities: [
            {
              name: "Elección de eventos relevantes y ferias",
              completed: false,
            },
            {
              name: "Preparar materiales de intercambio (tarjetas, flyers, etc.)",
              completed: false,
            },
            {
              name: "Obtener bases de datos de contacto de los participantes",
              completed: false,
            },
          ],
        },
        {
          name: "Llamadas de ventas",
          completionPercentage: 0,
          description:
            "Llamadas de ventas para generar leads y construir relaciones",
          keyActivities: [
            {
              name: "Contruir estrategia de hunters",
              completed: false,
            },
            {
              name: "Preparar materiales de venta",
              completed: false,
            },
            {
              name: "Definir script de ventas",
              completed: false,
            },
            {
              name: "Definir segmentos de clientes",
              completed: false,
            },
            {
              name: "Recopilar feedback de clientes",
              completed: false,
            },
          ],
        },
        {
          name: "Email Marketing",

          completionPercentage: 0,
          description:
            "Enviar correos masivos de bases de datos previamente calificadas.",
          keyActivities: [
            {
              name: "Planeacion de campañas",
              completed: false,
            },
            {
              name: "Obtenion de bases de datos Ej: Camara de comercio, gobierno. etc",
              completed: false,
            },
            {
              name: "Segmentación avanzada por intereses",
              completed: false,
            },
            {
              name: "Creación de piezas graficas",
              completed: false,
            },
            {
              name: "Plan de flujos de correos.",
              completed: false,
            },
            {
              name: "Definicion de Call To Action con UTM. (Ej: Descargar e-book, inscribirse en curso, etc)",
              completed: false,
            },
            {
              name: "Creacion de Pruebas A/B",
              completed: false,
            },
          ],
        },
        {
          name: "Whatsapp Marketing",

          completionPercentage: 0,
          description:
            "Enviar mensajes masivos de bases de datos previamente calificadas.",
          keyActivities: [
            {
              name: "Planeacion de campañas",
              completed: false,
            },
            {
              name: "Obtenion de bases de datos Ej: Camara de comercio, gobierno. etc",
              completed: false,
            },
            {
              name: "Segmentación avanzada por intereses",
              completed: false,
            },
            {
              name: "Planeacion de incentivos y/o oferta de valor.",
              completed: false,
            },
            {
              name: "Creación de mensajes clave",
              completed: false,
            },
            {
              name: "Configuracion del CRM - Plantillas de mensajes.",
              completed: false,
            },
          ],
        },
      ],
    },
  },
  {
    id: "mofu",
    title: "Middle of Funnel",
    leadCount: 22839,
    color: "bg-green-500",
    content: {
      title: "Consideration Stage",
      description:
        "Users evaluating your solutions and comparing with alternatives",
      channels: [
        {
          name: "Email Marketing",

          completionPercentage: 0,
          description:
            "Comunicación directa con leads que ya mostraron interés inicial. Enfocado en nutrir relaciones y profundizar el conocimiento sobre tus soluciones.",
          keyActivities: [
            {
              name: "Creación de secuencias de nurturing automatizadas",
              completed: false,
            },
            { name: "Segmentación avanzada por intereses", completed: false },
            {
              name: "Envío de newsletters con contenido de valor",
              completed: false,
            },
            {
              name: "Campañas de reactivación para leads fríos",
              completed: false,
            },
            { name: "A/B testing de asuntos y contenidos", completed: false },
          ],
        },
        {
          name: "Retargeting",

          completionPercentage: 0,
          description:
            "Campañas publicitarias dirigidas a usuarios que ya interactuaron con tu marca pero no han convertido. Mantiene tu oferta presente.",
          keyActivities: [
            { name: "Creación de audiencias personalizadas", completed: false },
            {
              name: "Desarrollo de creatividades específicas por interacción",
              completed: false,
            },
            { name: "Secuenciación de mensajes progresivos", completed: false },
            {
              name: "Ofertas exclusivas para visitantes recurrentes",
              completed: false,
            },
            {
              name: "Optimización por frecuencia y tiempo de exposición",
              completed: false,
            },
          ],
        },
        {
          name: "Webinars/Eventos",

          completionPercentage: 0,
          description:
            "Sesiones educativas o demostrativas que permiten interacción más profunda con prospectos interesados y construcción de autoridad.",
          keyActivities: [
            { name: "Planificación de webinars educativos", completed: false },
            {
              name: "Sesiones de Q&A con expertos del sector",
              completed: false,
            },
            {
              name: "Workshops prácticos relacionados con tu solución",
              completed: false,
            },
            {
              name: "Eventos de networking para tu comunidad",
              completed: false,
            },
            { name: "Masterclasses sobre temas específicos", completed: false },
          ],
        },
        {
          name: "Case Studies",

          completionPercentage: 0,
          description:
            "Demostración de resultados concretos con clientes reales para construir credibilidad y mostrar aplicaciones prácticas.",
          keyActivities: [
            { name: "Entrevistas a clientes satisfechos", completed: false },
            {
              name: "Documentación de métricas y resultados",
              completed: false,
            },
            { name: "Creación de narrativas convincentes", completed: false },
            { name: "Producción de videos testimoniales", completed: false },
            {
              name: "Desarrollo de PDF descargables con casos completos",
              completed: false,
            },
          ],
        },
        {
          name: "Ebooks/Whitepapers",

          completionPercentage: 0,
          description:
            "Contenido en profundidad que requiere datos de contacto para su descarga, combinando valor educativo con generación de leads cualificados.",
          keyActivities: [
            {
              name: "Desarrollo de investigaciones originales",
              completed: false,
            },
            {
              name: "Creación de guías completas sobre problemas específicos",
              completed: false,
            },
            {
              name: "Diseño de templates y recursos descargables",
              completed: false,
            },
            {
              name: "Elaboración de comparativas detalladas de soluciones",
              completed: false,
            },
            {
              name: "Producción de informes de tendencias con datos propios",
              completed: false,
            },
          ],
        },
        {
          name: "Membresías/Comunidades",

          completionPercentage: 0,
          description:
            "Espacios exclusivos donde los interesados pueden profundizar en el conocimiento, interactuar con pares y recibir soporte especializado.",
          keyActivities: [
            {
              name: "Creación de foros de discusión moderados",
              completed: false,
            },
            {
              name: "Desarrollo de contenido exclusivo para miembros",
              completed: false,
            },
            {
              name: "Organización de eventos virtuales periódicos",
              completed: false,
            },
            {
              name: "Implementación de sistemas de gamificación",
              completed: false,
            },
            {
              name: "Facilitación de networking entre miembros",
              completed: false,
            },
          ],
        },
        {
          name: "Social Selling",

          completionPercentage: 0,
          description:
            "Estrategia de ventas a través de redes sociales profesionales para construir relaciones con prospectos interesados mediante interacciones personalizadas.",
          keyActivities: [
            {
              name: "Optimización de perfiles profesionales",
              completed: false,
            },
            {
              name: "Interacción regular con contenido de prospectos",
              completed: false,
            },
            {
              name: "Envío de mensajes personalizados no intrusivos",
              completed: false,
            },
            {
              name: "Compartir contenido relevante específico",
              completed: false,
            },
            {
              name: "Participación activa en grupos de la industria",
              completed: false,
            },
          ],
        },
      ],
    },
  },
  {
    id: "bofu",
    title: "Bottom of Funnel",
    leadCount: 11419,
    color: "bg-purple-500",
    content: {
      title: "Decision Stage",
      description: "Users ready to make a purchase decision",
      channels: [
        {
          name: "Sales Enablement",

          completionPercentage: 0,
          description:
            "Supporting sales team with tools and content to close deals effectively.",
          keyActivities: [
            { name: "Desarrollo de materiales de venta", completed: false },
            { name: "Capacitación del equipo comercial", completed: false },
            { name: "Implementación de CRM", completed: false },
            { name: "Automatización de seguimiento", completed: false },
            { name: "Análisis de ciclo de venta", completed: false },
          ],
        },
        {
          name: "Llamadas de ventas",

          completionPercentage: 0,
          description:
            "Llamadas de ventas para cerrar y hacer seguimiento a las ventas",
          keyActivities: [
            { name: "Script de ventas", completed: false },
            { name: "Diseño de materiales de venta", completed: false },
            { name: "Capacitación de ventas", completed: false },
            {
              name: "Dolores del cliente y gatillos mentales",
              completed: false,
            },
            { name: "Registro de llamadas y seguimiento", completed: false },
          ],
        },
        {
          name: "Lead Scoring",

          completionPercentage: 0,
          description:
            "Qualifying and prioritizing leads based on behavior and characteristics.",
          keyActivities: [
            {
              name: "Definición de criterios de calificación",
              completed: false,
            },
            {
              name: "Implementación de sistema de puntuación",
              completed: false,
            },
            { name: "Integración con CRM", completed: false },
            { name: "Monitoreo de comportamiento", completed: false },
            { name: "Optimización de criterios", completed: false },
          ],
        },
        {
          name: "Landing Pages",

          completionPercentage: 0,
          description:
            "Páginas optimizadas para conversión con ofertas específicas, pruebas gratuitas o demostraciones para usuarios listos para decidir.",
          keyActivities: [
            {
              name: "Diseño de páginas con enfoque en conversión",
              completed: false,
            },
            { name: "Desarrollo de formularios optimizados", completed: false },
            { name: "Creación de CTA persuasivos", completed: false },
            { name: "A/B testing de elementos clave", completed: false },
            { name: "Implementación de pruebas sociales", completed: false },
          ],
        },
        {
          name: "Email Directo",

          completionPercentage: 0,
          description:
            "Comunicaciones personalizadas con ofertas específicas, descuentos y llamados a la acción directos para cerrar ventas.",
          keyActivities: [
            { name: "Desarrollo de secuencias de cierre", completed: false },
            { name: "Personalización avanzada de ofertas", completed: false },
            {
              name: "Creación de emails con sentido de urgencia",
              completed: false,
            },
            {
              name: "Seguimiento automático de no respondidos",
              completed: false,
            },
            {
              name: "Integración con CRM para seguimiento de ventas",
              completed: false,
            },
          ],
        },
        {
          name: "Programa de Pruebas",

          completionPercentage: 0,
          description:
            "Oferta de experiencia limitada pero funcional del producto/servicio que permite al usuario comprobar el valor antes de la compra completa.",
          keyActivities: [
            {
              name: "Configuración de períodos de prueba gratuita",
              completed: false,
            },
            { name: "Desarrollo de onboarding simplificado", completed: false },
            {
              name: "Implementación de hitos de valor rápido",
              completed: false,
            },
            {
              name: "Creación de secuencias de soporte proactivo",
              completed: false,
            },
            {
              name: "Diseño de estrategias de conversión post-prueba",
              completed: false,
            },
          ],
        },
        {
          name: "Incentivos de Cierre",

          completionPercentage: 0,
          description:
            "Ofertas especiales con límite temporal que incentivan la decisión inmediata reduciendo la percepción de riesgo o incrementando el valor.",
          keyActivities: [
            {
              name: "Desarrollo de descuentos por tiempo limitado",
              completed: false,
            },
            {
              name: "Creación de paquetes con valor añadido",
              completed: false,
            },
            {
              name: "Implementación de garantías extendidas",
              completed: false,
            },
            {
              name: "Diseño de programas de referidos con incentivos",
              completed: false,
            },
            {
              name: "Ofertas de implementación o migración gratuita",
              completed: false,
            },
            {
              name: "Cupones de descuento",
              completed: false,
            },
          ],
        },
        {
          name: "Chatbots/Live Chat",

          completionPercentage: 0,
          description:
            "Sistemas de comunicación inmediata para resolver dudas de última hora que podrían frenar la conversión final.",
          keyActivities: [
            {
              name: "Configuración de respuestas automáticas a FAQs",
              completed: false,
            },
            {
              name: "Implementación de asistentes en páginas de conversión",
              completed: false,
            },
            {
              name: "Diseño de flujos conversacionales para cierre",
              completed: false,
            },
            {
              name: "Integración con equipo de ventas para escalado",
              completed: false,
            },
            {
              name: "Análisis de conversaciones para optimización",
              completed: false,
            },
          ],
        },
        {
          name: "Referidos",

          completionPercentage: 0,
          description:
            "Programas de incentivos para recompensar a los clientes por referir a nuevos leads.",
          keyActivities: [
            {
              name: "Planear estrategia de referidos",
              completed: false,
            },
            {
              name: "Determinar incentivos",
              completed: false,
            },
          ],
        },
      ],
    },
  },
];
