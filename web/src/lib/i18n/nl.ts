import type { Translation } from './types';
// get version from package.json


export const nl: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar voor ChatGPT: Toolbox + Dock",
    tagline: "Een toolbox en dock die ChatGPT zonder rommel verbeteren.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} is nu beschikbaar`,
    heroHeadline: "Versterk je",
    heroAccent: "chatervaring",
    heroBody: "Sidecar is de productiviteitstoolbox voor ChatGPT: een slimme dock, brede modus, tokentracking, macro’s en codetools — direct geïntegreerd in je interface.",
    ctaPrimary: "Installeer Sidecar",
    ctaSecondary: "Bekijk GitHub / Bron",
    legalDisclaimer: "Niet gelieerd aan OpenAI.",
    availableOnAllMajorBrowsers: "Beschikbaar op alle grote browsers"
  },
  seo: {
    defaultTitle: "Sidecar voor ChatGPT: de ultieme productiviteitsdock",
    defaultDescription: "Verbeter ChatGPT met een native zijbalkdock, brede modus, macrocommando’s en realtime tokentracking. De essentiële browserextensie voor power users."
  },
  nav: {
    features: "Functies",
    macros: "Macro’s",
    roadmap: "Roadmap",
    testimonials: "Getuigenissen",
    github: "GitHub / Bron"
  },
  stats: {
    activeUsers: "Actieve gebruikers",
    promptsSaved: "Opgeslagen prompts",
    tokensTracked: "Getrackte tokens",
    rating: "Beoordeling",
    timeSaved: "Bespaarde tijd",
    promptLibrary: "Promptbibliotheek",
    privacyFocus: "Focus op privacy",
    betaStatus: "Beta-status",
    suffixPerWeek: "u/week",
    noteProjected: "per gebruiker geschat",
    noteTemplates: "templates inbegrepen",
    noteLocalStorage: "alleen lokale opslag",
    notePublicPreview: "publieke preview beschikbaar"
  },
  featuresHeader: {
    headline: "Krachtige tools voor power users",
    subhead: "Alles wat je nodig hebt om je AI-gesprekken effectiever te beheren, direct ingebouwd in de interface die je al gebruikt."
  },
  features: [
    {
      title: "Slimme dock",
      description: "Een persistente zijbalkdock voor directe toegang tot je favoriete tools en instellingen zonder de UI te vervuilen."
    },
    {
      title: "Zijbalk toggelen",
      description: "Schakel de conversatiezijbalk moeiteloos in/uit om te focussen op je chatinhoud."
    },
    {
      title: "Brede modus",
      description: "Breek uit de smalle gecentreerde weergave. Gebruik de volledige schermbreedte voor je gesprek."
    },
    {
      title: "Invoercontrole",
      description: "Vergroot of klap het invoerveld in om meer conversatiegeschiedenis te zien."
    },
    {
      title: "Code-superkrachten",
      description: "Inklapbare codeblokken voor betere leesbaarheid en directe HTML-previews."
    },
    {
      title: "Promptbibliotheek",
      description: "Bewaar vaak gebruikte prompts en open je recente geschiedenis direct. Niet meer hetzelfde context hertypen."
    },
    {
      title: "Realtime statusbalk",
      description: "Realtime inzicht in tokengebruik, woordenaantal en geschatte API-kosten."
    },
    {
      title: "Modelwisselaar",
      description: "Modelkiezer in de dock voor sneller wisselen tussen modellen."
    },
    {
      title: "Aangepaste typografie",
      description: "Pas je leeservaring aan met systeemfonts of Google Fonts."
    },
    {
      title: "Volledige configuratie",
      description: "Diepe aanpassing van extensiegedrag met import/export van instellingen."
    }
  ],
  howItWorks: {
    headline: "Hoe het werkt",
    subhead: "Drie stappen. Minimaal drama. Je browser zal je dankbaar zijn.",
    steps: [
      {
        title: "Installeer vanuit je store",
        body: "Voeg Sidecar toe vanuit de Chrome Web Store, Edge Add-ons of Firefox Add-ons. (Links zijn tijdelijke aanduidingen tot release.)",
        icon: "Download"
      },
      {
        title: "Activeer op ChatGPT",
        body: "Open ChatGPT en schakel Sidecar in. Als het is ingeschakeld, is het er. Geen instellingsrituelen vereist.",
        icon: "ToggleRight"
      },
      {
        title: "Voer macro's + commando's uit",
        body: "Gebruik Ctrl+K om het commandopalet te openen. Sla macro's op, speel flows opnieuw af en houd je handen op het toetsenbord.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "De magie van macro's",
    subhead: "Automatiseer repetitieve taken. Maak je eigen sneltoetsen. Chat als een pro.",
    items: [
      {
        title: "Aangepaste sneltoetsen",
        body: "Definieer je eigen sneltoetsen om complexe acties te activeren.",
        icon: "Keyboard"
      },
      {
        title: "Templatevariabelen",
        body: "Gebruik placeholders in je macro's voor dynamische inhoud.",
        icon: "Braces"
      },
      {
        title: "Deelbaar",
        body: "Exporteer je macro's en deel ze met het team.",
        icon: "Share2"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Bèta-tester",
      quote: "De brede modus veranderde volledig hoe ik code lees. Nooit meer horizontaal scrollen."
    },
    {
      name: "Sarah K.",
      role: "Bèta-tester",
      quote: "Fijn dat mijn macro’s lokaal worden opgeslagen. Eindelijk een productiviteitstool die privacy respecteert."
    },
    {
      name: "Devin R.",
      role: "Vroege toegang",
      quote: "De tokenmeter in de dock is een gamechanger voor het beheren van mijn API-context."
    }
  ],
  secondaryFeatures: {
    title: "Meer dan alleen een dock",
    vscodePets: {
      title: "VS Code Pets",
      description: "Breng plezier in je workflow met je favoriete VS Code-huisdieren in de zijbalk."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Volg RPG-statistieken en voortgang automatisch terwijl je chat en taken voltooit."
    },
    downloads: {
      title: "Modulaire downloads",
      description: "Stel Sidecar installatie samen. Kies alleen de componenten die je nodig hebt om het licht te houden.",
      totalSize: "Totale installatiemaat",
      download: "Geselecteerden downloaden",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Essentiële runtime- en dockfunctionaliteit.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Virtuele metgezellen voor je zijbalk.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "RPG-voortgangstracker.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Lokale analytics",
          description: "Geavanceerde grafieken en gebruiksstatistieken.",
          size: 15,
          required: false
        }
      ]
    }
  },
  legal: {
    privacyTitle: "Privacybeleid",
    termsTitle: "Servicevoorwaarden",
    effectiveDate: "Ingangsdatum"
  },
  footer: {
    product: "Product",
    legal: "Juridisch",
    statusOperational: "Status: Operationeel"
  },
  faqSection: {
    headline: "Veelgestelde vragen",
    subhead: "Alles wat je moet weten over Sidecar en compatibiliteit met browserextensies"
  },
  faqs: [
    {
      question: "Wat is Sidecar voor ChatGPT?",
      answer: "Sidecar is een productiviteitstoolbox en dock die je ChatGPT-ervaring verbetert met een persistente zijbalk, brede modus, tokentracking, macro’s en codetools — geïntegreerd in de interface."
    },
    {
      question: "Is Sidecar gratis?",
      answer: "Ja, Sidecar is volledig gratis en open source. Productiviteitstools moeten voor iedereen toegankelijk zijn."
    },
    {
      question: "Werkt Sidecar met alle ChatGPT-modellen?",
      answer: "Ja! Sidecar is compatibel met alle modellen, inclusief GPT-4 en GPT-3.5, en verbetert de interface ongeacht het gebruikte model."
    },
    {
      question: "Hoe gaat Sidecar om met mijn gegevens?",
      answer: "Alle gegevens (prompts, instellingen, macro’s) worden lokaal op je apparaat opgeslagen. We verzamelen geen persoonlijke informatie en volgen je gebruik niet."
    },
    {
      question: "Welke functies biedt Sidecar?",
      answer: "Sidecar bevat een slimme dock, brede modus, realtime tokentracking, promptbibliotheek, inklapbare codeblokken, modelwisselaar en aanpasbare typografie."
    },
    {
      question: "Hoe installeer ik Sidecar?",
      answer: "Installeer de extensie via de Chrome Web Store of Firefox Add-ons. Na installatie integreert Sidecar automatisch met ChatGPT."
    }
  ]
};
