import type { Translation } from './types';
// get version from package.json


export const it: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar per ChatGPT: Toolbox + Dock",
    tagline: "Una toolbox e un dock che migliorano ChatGPT senza disordine.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} è ora disponibile`,
    heroHeadline: "Potenzia la tua",
    heroAccent: "esperienza di chat",
    heroBody: "Sidecar è la toolbox di produttività per ChatGPT: un dock intelligente, modalità ampia, monitoraggio dei token, macro e strumenti di codice integrati direttamente nella tua interfaccia.",
    ctaPrimary: "Installa Sidecar",
    ctaSecondary: "Vedi GitHub / Sorgente",
    legalDisclaimer: "Non affiliato con OpenAI.",
    availableOnAllMajorBrowsers: "Disponibile su tutti i principali browser"
  },
  seo: {
    defaultTitle: "Sidecar per ChatGPT: il dock di produttività definitivo",
    defaultDescription: "Migliora ChatGPT con un dock laterale nativo, modalità ampia, comandi macro e monitoraggio dei token in tempo reale. L’estensione essenziale per gli utenti avanzati."
  },
  nav: {
    features: "Funzionalità",
    macros: "Macro",
    roadmap: "Roadmap",
    testimonials: "Testimonianze",
    github: "GitHub / Sorgente"
  },
  stats: {
    activeUsers: "Utenti attivi",
    promptsSaved: "Prompt salvati",
    tokensTracked: "Token monitorati",
    rating: "Valutazione",
    timeSaved: "Tempo risparmiato",
    promptLibrary: "Libreria di prompt",
    privacyFocus: "Focus sulla privacy",
    betaStatus: "Stato beta",
    suffixPerWeek: "h/set",
    noteProjected: "stimato per utente",
    noteTemplates: "modelli inclusi",
    noteLocalStorage: "solo archiviazione locale",
    notePublicPreview: "anteprima pubblica disponibile"
  },
  featuresHeader: {
    headline: "Strumenti potenti per utenti esperti",
    subhead: "Tutto ciò di cui hai bisogno per gestire le tue conversazioni AI in modo più efficace, integrato direttamente nell'interfaccia che già usi."
  },
  features: [
    {
      title: "Dock intelligente",
      description: "Un dock laterale persistente per accedere istantaneamente ai tuoi strumenti e impostazioni preferiti senza sovraccaricare l’interfaccia."
    },
    {
      title: "Alterna barra laterale",
      description: "Attiva/disattiva facilmente la barra laterale della conversazione per concentrarti solo sul contenuto."
    },
    {
      title: "Modalità ampia",
      description: "Libera la vista centrata e stretta. Espandi la conversazione per usare tutta la larghezza dello schermo."
    },
    {
      title: "Controllo input",
      description: "Ridimensiona o comprimi l’area di input per vedere più cronologia della conversazione."
    },
    {
      title: "Superpoteri del codice",
      description: "Blocchi di codice comprimibili per una migliore leggibilità e anteprime HTML istantanee."
    },
    {
      title: "Libreria di prompt",
      description: "Salva i prompt frequenti e accedi alla cronologia recente all’istante. Niente più ripetizioni."
    },
    {
      title: "Barra di stato in tempo reale",
      description: "Monitoraggio in tempo reale dei token, conteggio parole e costi stimati dell’API."
    },
    {
      title: "Selettore modello",
      description: "Selettore di modello nel dock per cambiare più rapidamente tra i modelli."
    },
    {
      title: "Tipografia personalizzata",
      description: "Personalizza la lettura cambiando le famiglie di font in Sistema o Google Fonts."
    },
    {
      title: "Configurazione completa",
      description: "Personalizzazione avanzata del comportamento dell’estensione con import/export delle impostazioni."
    }
  ],
  howItWorks: {
    headline: "Come funziona",
    subhead: "Tre passaggi. Minimo dramma. Il tuo browser ti ringrazia.",
    steps: [
      {
        title: "Installa dal tuo store",
        body: "Aggiungi Sidecar da Chrome Web Store, Edge Add-ons o Firefox Add-ons. (I link sono segnaposto fino al rilascio.)",
        icon: "Download"
      },
      {
        title: "Abilitalo su ChatGPT",
        body: "Apri ChatGPT e attiva Sidecar. Se è abilitato, è disponibile. Nessun rituale di fissaggio richiesto.",
        icon: "ToggleRight"
      },
      {
        title: "Esegui macro + comandi",
        body: "Usa Ctrl+K per aprire la tavolozza dei comandi. Salva macro, riproduci flussi e tieni le mani sulla tastiera.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Macro che aiutano davvero",
    subhead: "Una tavolozza dei comandi + negozio di macro progettati per automatizzare il tuo flusso di lavoro senza dirottare il compositore di ChatGPT.",
    items: [
      {
        title: "Tavolozza dei comandi (Ctrl+K)",
        body: "Digita comandi solo nell'input della tavolozza di Sidecar. Niente hack slash-command nel compositore nativo, nessuna rottura IME.",
        icon: "Command"
      },
      {
        title: "Macro + Script di flusso",
        body: "Salva, condividi, pubblica ed esegui script di automazione macro che alimentano il tuo motore di flusso (flow.ts).",
        icon: "Workflow"
      },
      {
        title: "Cronologia simile a terminale",
        body: "Su/Giù scorre i tuoi comandi recenti come una shell. Persistente in chrome.storage.local e limitato per mantenere la sanità mentale.",
        icon: "History"
      },
      {
        title: "Stime dei token, pigramente",
        body: "Cache per thread, aggiornamento nel tempo di inattività ed evita di ri-tokenizzare l'universo a ogni mutazione.",
        icon: "Gauge"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Beta tester",
      quote: "La modalità ampia ha rivoluzionato il modo in cui leggo il codice. Basta scorrimento orizzontale."
    },
    {
      name: "Sarah K.",
      role: "Beta tester",
      quote: "Mi piace che le mie macro siano archiviate localmente. Finalmente uno strumento che rispetta la privacy."
    },
    {
      name: "Devin R.",
      role: "Accesso anticipato",
      quote: "Il contatore dei token nel dock cambia le regole per gestire la finestra di contesto API."
    }
  ],
  secondaryFeatures: {
    title: "Più di un semplice dock",
    vscodePets: {
      title: "Animali di VS Code",
      description: "Porta gioia al tuo flusso di lavoro con i tuoi animali preferiti di VS Code nella barra laterale."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Traccia automaticamente statistiche e progressi RPG mentre chatti e completi attività."
    },
    downloads: {
      title: "Download modulari",
      description: "Personalizza l’installazione di Sidecar. Seleziona i componenti necessari per mantenere il footprint ridotto.",
      totalSize: "Dimensione totale dell’installazione",
      download: "Scarica selezionati",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Funzionalità essenziali di runtime e dock.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Compagni virtuali per la barra laterale.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "Sistema di tracciamento dei progressi RPG.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Analisi locali",
          description: "Grafici avanzati e elaborazione delle statistiche.",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "Bit della roadmap (la pila 'bello da avere')",
    subhead: "Alcuni degli aggiornamenti più grandi che si adattano alle tue specifiche. Questi sono punti elenco della pagina di destinazione, non promesse.",
    items: [
      {
        title: "Pulizia del titolo della pagina",
        body: "Rimuovi 'ChatGPT - ' dal titolo della scheda quando in esecuzione nel contesto dell'estensione."
      },
      {
        title: "UX Popover",
        body: "I popover si chiudono al clic esterno e sulle azioni al loro interno."
      },
      {
        title: "Animazione maniglia di presa",
        body: "Micro-maniglia carina che si espande al passaggio del mouse e si anima dolcemente."
      },
      {
        title: "Richiamo prompt nel compositore",
        body: "Freccia su visualizza l'anteprima dei prompt recenti; Freccia destra inserisce il prompt completo."
      },
      {
        title: "Protezioni scorrimento + modalità ampia",
        body: "Ferma lo scorrimento automatico in basso opzionalmente; correggi l'overflow della modalità ampia su prompt lunghi."
      },
      {
        title: "Compressione dei messaggi",
        body: "Comprimi chat lunghe con anteprima + conteggio caratteri; auto-comprimi all'invio oltre X caratteri."
      },
      {
        title: "I tuoi blocchi di codice",
        body: "Rileva ``` nei tuoi messaggi, renderizza blocchi stilizzati, evidenziazione della sintassi, clicca per copiare."
      },
      {
        title: "Ridimensionamento dei caratteri",
        body: "Ridimensiona l'interfaccia utente di Sidecar senza cambiare lo zoom del browser."
      }
    ]
  },
  ctaSection: {
    headline: "Pronto ad aggiornare il tuo flusso di lavoro?",
    body: "Costruiscilo in pubblico, spediscilo velocemente e lascia che i tuoi utenti lo spingano verso la grandezza."
  },
  stores: {
    chrome: {
      ariaLabel: "Disponibile nel Chrome Web Store",
      availableIn: "Disponibile nel",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Disponibile su componenti aggiuntivi Microsoft Edge",
      availableOn: "Disponibile su",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Ottieni l'add-on per Firefox",
      getAddon: "Ottieni l'add-on",
      forFirefox: "per Firefox"
    }
  },
  legal: {
    privacyTitle: "Informativa sulla privacy",
    termsTitle: "Termini di servizio",
    effectiveDate: "Data di efficacia"
  },
  footer: {
    product: "Prodotto",
    legal: "Legale",
    statusOperational: "Tutti i sistemi operativi"
  },
  faqSection: {
    headline: "Domande frequenti",
    subhead: "Tutto ciò che devi sapere su Sidecar e la compatibilità delle estensioni del browser"
  },
  faqs: [
    {
      question: "Che cos’è Sidecar per ChatGPT?",
      answer: "Sidecar è una toolbox di produttività e un dock che migliora l’esperienza ChatGPT con barra laterale persistente, modalità ampia, monitoraggio dei token, macro e strumenti di codice, integrati direttamente nell’interfaccia."
    },
    {
      question: "Sidecar è gratuito?",
      answer: "Sì, Sidecar è completamente gratuito e open source. Crediamo che gli strumenti di produttività debbano essere accessibili a tutti."
    },
    {
      question: "Sidecar funziona con tutti i modelli di ChatGPT?",
      answer: "Sì! Sidecar è compatibile con tutti i modelli, inclusi GPT-4 e GPT-3.5. L’estensione migliora l’interfaccia indipendentemente dal modello utilizzato."
    },
    {
      question: "Come gestisce Sidecar i miei dati?",
      answer: "Tutti i dati (prompt, impostazioni, macro) sono archiviati localmente sul dispositivo. Non raccogliamo informazioni personali né tracciamo l’uso."
    },
    {
      question: "Quali funzionalità offre Sidecar?",
      answer: "Sidecar include dock intelligente, modalità ampia, monitoraggio in tempo reale dei token, libreria di prompt, blocchi di codice comprimibili, selettore di modello e tipografia personalizzabile."
    },
    {
      question: "Come installo Sidecar?",
      answer: "Installa l’estensione dal Chrome Web Store o da Firefox Add-ons. Una volta installata, Sidecar si integra automaticamente con ChatGPT."
    }
  ]
};
