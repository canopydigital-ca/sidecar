import type { Translation } from './types';

export const en: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar for ChatGPT: Toolbox + Dock",
    tagline: "A toolbox + dock that upgrades ChatGPT without clutter.",
    versionBadge: "Sidecar v2.0 is now available",
    heroHeadline: "Supercharge your",
    heroAccent: "Chat Experience",
    heroBody: "Sidecar is the productivity toolbox for ChatGPT: a smart dock, wide mode, token tracking, macros, and code tools built right into your interface.",
    ctaPrimary: "Install Sidecar",
    ctaSecondary: "View GitHub / Source",
    legalDisclaimer: "Not affiliated with OpenAI."
  },
  seo: {
    defaultTitle: "Sidecar for ChatGPT: The Ultimate Productivity Dock",
    defaultDescription: "Upgrade ChatGPT with a native sidebar dock, wide mode, macro commands, and real-time token tracking. The essential browser extension for power users."
  },
  nav: {
    features: "Features",
    macros: "Macros",
    roadmap: "Roadmap",
    testimonials: "Testimonials",
    github: "GitHub / Source"
  },
  stats: {
    activeUsers: "Active Users",
    promptsSaved: "Prompts Saved",
    tokensTracked: "Tokens Tracked",
    rating: "Rating",
    timeSaved: "Time Saved",
    promptLibrary: "Prompt Library",
    privacyFocus: "Privacy Focus",
    betaStatus: "Beta Status",
    suffixPerWeek: "h/wk",
    noteProjected: "projected per user",
    noteTemplates: "templates included",
    noteLocalStorage: "local storage only",
    notePublicPreview: "public preview available"
  },
  features: [
    {
      title: "Smart Dock",
      description: "A persistent sidebar dock for instant access to your favorite tools and settings without cluttering the UI."
    },
    {
      title: "Sidebar Toggle",
      description: "Effortlessly toggle the main conversation sidebar to focus purely on your chat content."
    },
    {
      title: "Wide Mode",
      description: "Break free from the centered narrow view. Expand the conversation to utilize your full screen width."
    },
    {
      title: "Input Control",
      description: "Resize or collapse the input area to view more of the conversation history at once."
    },
    {
      title: "Code Superpowers",
      description: "Collapsible code blocks for better readability and instant HTML previews for web developers."
    },
    {
      title: "Prompt Library",
      description: "Save frequently used prompts and access your recent history instantly. Never re-type the same context."
    },
    {
      title: "Live Status Bar",
      description: "Real-time tracking of token usage, word count, and estimated API costs at a glance."
    },
    {
      title: "Model Switcher",
      description: "Relocated model picker in the dock for faster switching between models."
    },
    {
      title: "Custom Typography",
      description: "Personalize your reading experience by changing font families to System or Google Fonts."
    },
    {
      title: "Full Config",
      description: "Deep customization of extension behavior with import/export capabilities for your settings."
    }
  ],
  testimonials: [
    {
      name: "Alex M.",
      role: "Beta Tester",
      quote: "The wide mode completely changed how I read code snippets. No more horizontal scrolling madness."
    },
    {
      name: "Sarah K.",
      role: "Beta Tester",
      quote: "I love that my macros are stored locally. Finally, a productivity tool that respects my privacy."
    },
    {
      name: "Devin R.",
      role: "Early Access",
      quote: "The token counter in the dock is a game changer for managing my API usage context window."
    }
  ],
  secondaryFeatures: {
    title: "More than just a dock",
    vscodePets: {
      title: "VS Code Pets",
      description: "Bring joy to your workflow with your favorite VS Code pets living in your sidebar."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Track your RPG stats and progress automatically as you chat and complete tasks."
    },
    downloads: {
      title: "Modular Downloads",
      description: "Customize your Sidecar installation. Select the components you need to keep your footprint small.",
      totalSize: "Total Install Size",
      download: "Download Selected",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Essential runtime and dock functionality.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Virtual companions for your sidebar.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "RPG progression system tracker.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Local Analytics",
          description: "Advanced charts and usage statistics processing.",
          size: 15,
          required: false
        }
      ]
    }
  },
  legal: {
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Service",
    effectiveDate: "Effective date"
  },
  faqs: [
    {
      question: "What is Sidecar for ChatGPT?",
      answer: "Sidecar is a productivity toolbox and dock that enhances your ChatGPT experience with features like a persistent sidebar, wide mode, token tracking, macros, and code tools - all built directly into your ChatGPT interface."
    },
    {
      question: "Is Sidecar free to use?",
      answer: "Yes, Sidecar is completely free and open source. We believe productivity tools should be accessible to everyone without cost barriers."
    },
    {
      question: "Does Sidecar work with all ChatGPT models?",
      answer: "Yes! Sidecar is compatible with all ChatGPT models including GPT-4, GPT-3.5, and any future models. The extension enhances the ChatGPT interface regardless of which model you're using."
    },
    {
      question: "How does Sidecar handle my data?",
      answer: "All your data (prompts, settings, macros) are stored locally on your device. We don't collect any personal information or track your usage. Your privacy is our priority."
    },
    {
      question: "What features does Sidecar offer?",
      answer: "Sidecar includes a smart dock sidebar, wide mode for expanded viewing, real-time token tracking, prompt library, code tools with collapsible blocks, model switcher, and customizable typography - all designed to supercharge your ChatGPT workflow."
    },
    {
      question: "How do I install Sidecar?",
      answer: "Simply install the browser extension from the Chrome Web Store or Firefox Add-ons. Once installed, Sidecar will automatically integrate with ChatGPT and enhance your experience with its productivity features."
    }
  ]
};
