import type { Translation } from './types';
// get version from package.json


export const da: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar til ChatGPT: Værktøjskasse + Dock",
    tagline: "En værktøjskasse og dock, der opgraderer ChatGPT uden rod.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} er nu tilgængelig`,
    heroHeadline: "Giv turbo til din",
    heroAccent: "chatoplevelse",
    heroBody: "Sidecar er produktivitets-værktøjskassen til ChatGPT: en smart dock, bred tilstand, token-sporing, makroer og kodeværktøjer direkte i din grænseflade.",
    ctaPrimary: "Installer Sidecar",
    ctaSecondary: "Se GitHub / Kilde",
    legalDisclaimer: "Ikke tilknyttet OpenAI.",
    availableOnAllMajorBrowsers: "Tilgængelig på alle større browsere"
  },
  seo: {
    defaultTitle: "Sidecar til ChatGPT: Den ultimative produktivitets-dock",
    defaultDescription: "Opgrader ChatGPT med en native sidepanel-dock, bred tilstand, makrokommandoer og token-sporing i realtid. Den essentielle udvidelse for superbrugere."
  },
  nav: {
    features: "Funktioner",
    macros: "Makroer",
    roadmap: "Roadmap",
    testimonials: "Udtalelser",
    github: "GitHub / Kilde"
  },
  stats: {
    activeUsers: "Aktive brugere",
    promptsSaved: "Gemte prompts",
    tokensTracked: "Sporede tokens",
    rating: "Bedømmelse",
    timeSaved: "Tid sparet",
    promptLibrary: "Prompt-bibliotek",
    privacyFocus: "Privatliv i fokus",
    betaStatus: "Beta-status",
    suffixPerWeek: "t/uge",
    noteProjected: "anslået pr. bruger",
    noteTemplates: "skabeloner inkluderet",
    noteLocalStorage: "kun lokal lagring",
    notePublicPreview: "offentlig forhåndsvisning tilgængelig"
  },
  featuresHeader: {
    headline: "Power tools til power users",
    subhead: "Alt hvad du behøver for at styre dine AI-samtaler mere effektivt, bygget direkte ind i den grænseflade, du allerede bruger."
  },
  features: [
    {
      title: "Smart dock",
      description: "En vedvarende dock i sidepanelet for øjeblikkelig adgang til dine yndlingsværktøjer og indstillinger uden at rode UI’et."
    },
    {
      title: "Sidepanel-skifter",
      description: "Skift let samtalens sidepanel for kun at fokusere på chatindholdet."
    },
    {
      title: "Bred tilstand",
      description: "Slip fri af den centrerede, smalle visning. Udvid samtalen til hele skærmens bredde."
    },
    {
      title: "Input-kontrol",
      description: "Ændr størrelse eller skjul inputområdet for at se mere af samtalehistorikken på én gang."
    },
    {
      title: "Kode-superkræfter",
      description: "Sammenklappelige kodeblokke for bedre læsbarhed og øjeblikkelige HTML-forhåndsvisninger."
    },
    {
      title: "Prompt-bibliotek",
      description: "Gem ofte brugte prompts og få øjeblikkelig adgang til din seneste historik. Ingen gentagen kontekst."
    },
    {
      title: "Live statuslinje",
      description: "Spor tokenforbrug, ordantal og anslåede API-omkostninger i realtid."
    },
    {
      title: "Modelskifter",
      description: "Modelvælgeren er flyttet til docken for hurtigere skift mellem modeller."
    },
    {
      title: "Tilpasset typografi",
      description: "Tilpas læseoplevelsen ved at ændre skrifttyper til System eller Google Fonts."
    },
    {
      title: "Fuld konfiguration",
      description: "Dyb tilpasning af udvidelsens adfærd med import/eksport af indstillinger."
    }
  ],
  howItWorks: {
    headline: "Sådan virker det",
    subhead: "Tre trin. Minimalt drama. Din browser takker dig.",
    steps: [
      {
        title: "Installer fra din butik",
        body: "Tilføj Sidecar fra Chrome Web Store, Edge Add-ons eller Firefox Add-ons. (Links er pladsholdere indtil du udgiver.)",
        icon: "Download"
      },
      {
        title: "Aktiver det på ChatGPT",
        body: "Åbn ChatGPT og slå Sidecar til. Hvis det er aktiveret, er det tilgængeligt. Intet fastgørelsesritual påkrævet.",
        icon: "ToggleRight"
      },
      {
        title: "Kør makroer + kommandoer",
        body: "Brug Ctrl+K til at åbne kommandopaletten. Gem makroer, afspil flows og hold dine hænder på tastaturet.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Makroer der faktisk hjælper",
    subhead: "En kommandopalet + makrobutik designet til at automatisere din arbejdsgang uden at kapre ChatGPT's skrivefelt.",
    items: [
      {
        title: "Kommandopalet (Ctrl+K)",
        body: "Skriv kommandoer kun i Sidecars paletindtastning. Ingen skråstreg-kommando-hacks i det native skrivefelt, ingen IME-brud.",
        icon: "Command"
      },
      {
        title: "Makroer + Flow Scripts",
        body: "Gem, del, udgiv og kør makroautomatiseringsscripts, der føder ind i din Flow-motor (flow.ts).",
        icon: "Workflow"
      },
      {
        title: "Terminal-lignende Historik",
        body: "Op/Ned gennemgår dine seneste kommandoer som en shell. Gemt i chrome.storage.local og begrænset for at holde det fornuftigt.",
        icon: "History"
      },
      {
        title: "Token-estimater, dovent",
        body: "Cache pr. tråd, opdater i inaktiv tid og undgå at gen-tokenisere universet ved hver ændring.",
        icon: "Gauge"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Beta-tester",
      quote: "Bred tilstand ændrede fuldstændig hvordan jeg læser kode. Farvel til vandret rulning."
    },
    {
      name: "Sarah K.",
      role: "Beta-tester",
      quote: "Jeg elsker at mine makroer lagres lokalt. Endelig et værktøj der respekterer privatliv."
    },
    {
      name: "Devin R.",
      role: "Tidlig adgang",
      quote: "Tokentælleren i docken er et gennembrud for håndtering af API-kontekstvinduet."
    }
  ],
  secondaryFeatures: {
    title: "Mere end blot en dock",
    vscodePets: {
      title: "VS Code Pets",
      description: "Bring glæde i arbejdsflowet med dine yndlings VS Code kæledyr i sidepanelet."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Spor automatisk dine RPG-statistikker og fremdrift mens du chatter og fuldfører opgaver."
    },
    downloads: {
      title: "Modulære downloads",
      description: "Tilpas din Sidecar-installation. Vælg kun de komponenter du har brug for, så installationen forbliver let.",
      totalSize: "Samlet installationsstørrelse",
      download: "Download valgte",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Nødvendig runtime og dock-funktionalitet.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Virtuelle ledsagere til dit sidepanel.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "Tracker for RPG-fremdrift.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Lokal analyse",
          description: "Avancerede grafer og behandling af brugsstatistikker.",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "Roadmap-bidder ('godt at have'-bunken)",
    subhead: "Nogle af de større opgraderinger, der passer til din specifikation. Disse er landingsside-punkter, ikke løfter.",
    items: [
      {
        title: "Oprydning af sidetitel",
        body: "Fjern 'ChatGPT - ' fra fanetitlen, når der køres i udvidelseskonteksten."
      },
      {
        title: "Popover UX",
        body: "Popovers lukker ved klik udenfor og ved handlinger inde i dem."
      },
      {
        title: "Gribe-håndtag animation",
        body: "Sødt mikro-håndtag, der udvides ved hover og animerer glat."
      },
      {
        title: "Prompt-genkaldelse i skrivefelt",
        body: "Pil op forhåndsviser seneste prompts; Højre pil indsætter fuld prompt."
      },
      {
        title: "Scroll + bred tilstand sikkerhedsforanstaltninger",
        body: "Stop auto-scroll til bunden valgfrit; fix bred tilstand overløb på lange prompts."
      },
      {
        title: "Besked-sammenklapning",
        body: "Klap lange chats sammen med forhåndsvisning + tegntælling; auto-klap sammen ved afsendelse over X tegn."
      },
      {
        title: "Dine kodeblokke",
        body: "Opdag ``` i dine beskeder, render stiliserede blokke, syntaksfremhævning, klik-for-at-kopiere."
      },
      {
        title: "Skrifttypeskalering",
        body: "Skaler Sidecar UI uden at ændre browserzoom."
      }
    ]
  },
  ctaSection: {
    headline: "Klar til at opgradere din arbejdsgang?",
    body: "Byg det offentligt, send det hurtigt, og lad dine brugere mobbe det til storhed."
  },
  stores: {
    chrome: {
      ariaLabel: "Tilgængelig i Chrome Web Store",
      availableIn: "Tilgængelig i",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Tilgængelig på Microsoft Edge Add-ons",
      availableOn: "Tilgængelig på",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Hent tilføjelsen til Firefox",
      getAddon: "Hent tilføjelsen",
      forFirefox: "til Firefox"
    }
  },
  legal: {
    privacyTitle: "Privatlivspolitik",
    termsTitle: "Servicevilkår",
    effectiveDate: "Ikrafttrædelsesdato"
  },
  footer: {
    product: "Produkt",
    legal: "Juridisk",
    statusOperational: "Alle systemer operationelle"
  },
  faqSection: {
    headline: "Ofte stillede spørgsmål",
    subhead: "Alt hvad du behøver at vide om Sidecar og browserudvidelseskompatibilitet"
  },
  faqs: [
    {
      question: "Hvad er Sidecar til ChatGPT?",
      answer: "Sidecar er en produktivitets-værktøjskasse og dock, der forbedrer din ChatGPT-oplevelse med vedvarende sidepanel, bred tilstand, token-sporing, makroer og kodeværktøjer — alt direkte i grænsefladen."
    },
    {
      question: "Er Sidecar gratis?",
      answer: "Ja, Sidecar er helt gratis og open source. Vi mener at produktivitetsværktøjer bør være tilgængelige for alle."
    },
    {
      question: "Virker Sidecar med alle ChatGPT-modeller?",
      answer: "Ja! Sidecar er kompatibel med alle modeller, inkl. GPT-4 og GPT-3.5, og forbedrer grænsefladen uanset model."
    },
    {
      question: "Hvordan håndterer Sidecar mine data?",
      answer: "Alle dine data (prompts, indstillinger, makroer) lagres lokalt på din enhed. Vi indsamler ikke personlige data eller sporer din brug."
    },
    {
      question: "Hvilke funktioner tilbyder Sidecar?",
      answer: "Sidecar inkluderer smart dock, bred tilstand, token-sporing i realtid, prompt-bibliotek, sammenklappelige kodeblokke, modelskifter og tilpasselig typografi."
    },
    {
      question: "Hvordan installerer jeg Sidecar?",
      answer: "Installer blot udvidelsen fra Chrome Web Store eller Firefox Add-ons. Efter installation integreres Sidecar automatisk med ChatGPT."
    }
  ]
};
