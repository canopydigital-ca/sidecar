import type { Translation } from './types';

export const es: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar para ChatGPT: Caja de herramientas + Dock",
    tagline: "Una caja de herramientas y dock que mejora ChatGPT sin desorden.",
    versionBadge: "Sidecar v2.0 ya está disponible",
    heroHeadline: "Potencia tu",
    heroAccent: "Experiencia de Chat",
    heroBody: "Sidecar es la caja de herramientas de productividad para ChatGPT: un dock inteligente, modo ancho, seguimiento de tokens, macros y herramientas de código integradas directamente en tu interfaz.",
    ctaPrimary: "Instalar Sidecar",
    ctaSecondary: "Ver GitHub / Código",
    legalDisclaimer: "No afiliado con OpenAI."
  },
  seo: {
    defaultTitle: "Sidecar para ChatGPT: El Dock Definitivo de Productividad",
    defaultDescription: "Mejora ChatGPT con un dock lateral nativo, modo ancho, comandos macro y seguimiento de tokens en tiempo real. La extensión esencial para usuarios avanzados."
  },
  nav: {
    features: "Características",
    macros: "Macros",
    roadmap: "Hoja de Ruta",
    testimonials: "Testimonios",
    github: "GitHub / Código"
  },
  stats: {
    activeUsers: "Usuarios Activos",
    promptsSaved: "Prompts Guardados",
    tokensTracked: "Tokens Rastreados",
    rating: "Valoración",
    timeSaved: "Tiempo Ahorrado",
    promptLibrary: "Biblioteca de Prompts",
    privacyFocus: "Enfoque en Privacidad",
    betaStatus: "Estado Beta",
    suffixPerWeek: "h/sem",
    noteProjected: "proyectado por usuario",
    noteTemplates: "plantillas incluidas",
    noteLocalStorage: "solo almacenamiento local",
    notePublicPreview: "vista previa pública disponible"
  },
  features: [
    {
      title: "Dock Inteligente",
      description: "Una barra lateral persistente para acceso instantáneo a tus herramientas y configuraciones favoritas sin desordenar la interfaz."
    },
    {
      title: "Alternar Barra Lateral",
      description: "Alterna sin esfuerzo la barra lateral principal de conversación para centrarte puramente en tu contenido de chat."
    },
    {
      title: "Modo Ancho",
      description: "Libérate de la vista estrecha centrada. Expande la conversación para utilizar todo el ancho de tu pantalla."
    },
    {
      title: "Control de Entrada",
      description: "Redimensiona o contrae el área de entrada para ver más historial de conversación a la vez."
    },
    {
      title: "Superpoderes de Código",
      description: "Bloques de código plegables para mejor legibilidad y previsualizaciones HTML instantáneas para desarrolladores web."
    },
    {
      title: "Biblioteca de Prompts",
      description: "Guarda prompts usados frecuentemente y accede a tu historial reciente al instante. Nunca vuelvas a escribir el mismo contexto."
    },
    {
      title: "Barra de Estado en Vivo",
      description: "Seguimiento en tiempo real del uso de tokens, conteo de palabras y costos estimados de API de un vistazo."
    },
    {
      title: "Selector de Modelo",
      description: "Selector de modelo reubicado en el dock para cambiar más rápido entre modelos."
    },
    {
      title: "Tipografía Personalizada",
      description: "Personaliza tu experiencia de lectura cambiando las familias de fuentes a System o Google Fonts."
    },
    {
      title: "Configuración Completa",
      description: "Personalización profunda del comportamiento de la extensión con capacidades de importación/exportación para tus ajustes."
    }
  ],
  testimonials: [
    {
      name: "Alex M.",
      role: "Probador Beta",
      quote: "El modo ancho cambió completamente cómo leo fragmentos de código. Se acabó la locura del desplazamiento horizontal."
    },
    {
      name: "Sarah K.",
      role: "Probador Beta",
      quote: "Me encanta que mis macros se guarden localmente. Finalmente, una herramienta de productividad que respeta mi privacidad."
    },
    {
      name: "Devin R.",
      role: "Acceso Anticipado",
      quote: "El contador de tokens en el dock cambia el juego para gestionar mi ventana de contexto de uso de API."
    }
  ],
  secondaryFeatures: {
    title: "Más que solo un dock",
    vscodePets: {
      title: "Mascotas de VS Code",
      description: "Lleva alegría a tu flujo de trabajo con tus mascotas favoritas de VS Code viviendo en tu barra lateral."
    },
    progressQuest: {
      title: "Búsqueda de Progreso",
      description: "Sigue tus estadísticas de RPG y progreso automáticamente mientras chateas y completas tareas."
    },
    downloads: {
      title: "Descargas Modulares",
      description: "Personaliza tu instalación de Sidecar. Selecciona los componentes que necesitas.",
      totalSize: "Tamaño Total",
      download: "Descargar Seleccionados",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Funcionalidad esencial y dock.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "Mascotas VS Code",
          description: "Compañeros virtuales para tu barra lateral.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Búsqueda de Progreso",
          description: "Sistema de seguimiento de progreso RPG.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Analíticas Locales",
          description: "Gráficos avanzados y procesamiento de estadísticas.",
          size: 15,
          required: false
        }
      ]
    }
  },
  legal: {
    privacyTitle: "Política de Privacidad",
    termsTitle: "Términos de Servicio",
    effectiveDate: "Fecha de vigencia"
  },
  faqs: [
    {
      question: "¿Qué es Sidecar para ChatGPT?",
      answer: "Sidecar es una caja de herramientas de productividad y dock que mejora tu experiencia con ChatGPT con funciones como una barra lateral persistente, modo ancho, seguimiento de tokens, macros y herramientas de código, todo integrado directamente en tu interfaz de ChatGPT."
    },
    {
      question: "¿Es Sidecar gratuito?",
      answer: "Sí, Sidecar es completamente gratuito y de código abierto. Creemos que las herramientas de productividad deberían ser accesibles para todos sin barreras de costo."
    },
    {
      question: "¿Funciona Sidecar con todos los modelos de ChatGPT?",
      answer: "¡Sí! Sidecar es compatible con todos los modelos de ChatGPT incluyendo GPT-4, GPT-3.5 y cualquier modelo futuro. La extensión mejora la interfaz de ChatGPT independientemente del modelo que uses."
    },
    {
      question: "¿Cómo maneja Sidecar mis datos?",
      answer: "Todos tus datos (prompts, configuraciones, macros) se almacenan localmente en tu dispositivo. No recopilamos información personal ni rastreamos tu uso. Tu privacidad es nuestra prioridad."
    },
    {
      question: "¿Qué características ofrece Sidecar?",
      answer: "Sidecar incluye un dock lateral inteligente, modo ancho para visualización expandida, seguimiento de tokens en tiempo real, biblioteca de prompts, herramientas de código con bloques colapsables, selector de modelos y tipografía personalizable, todo diseñado para potenciar tu flujo de trabajo con ChatGPT."
    },
    {
      question: "¿Cómo instalo Sidecar?",
      answer: "Simplemente instala la extensión del navegador desde Chrome Web Store o Firefox Add-ons. Una vez instalada, Sidecar se integrará automáticamente con ChatGPT y mejorará tu experiencia con sus funciones de productividad."
    }
  ]
};
