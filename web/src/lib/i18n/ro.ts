import type { Translation } from './types';
// get version from package.json


export const ro: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar pentru ChatGPT: Toolbox + Dock",
    tagline: "O cutie de instrumente și un dock care îmbunătățesc ChatGPT fără aglomerație.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} este acum disponibil`,
    heroHeadline: "Turbochargează-ți",
    heroAccent: "experiența de chat",
    heroBody: "Sidecar este cutia de instrumente pentru productivitate pentru ChatGPT: un dock inteligent, mod lat, urmărirea tokenurilor, macro-uri și instrumente de cod integrate direct în interfață.",
    ctaPrimary: "Instalează Sidecar",
    ctaSecondary: "Vezi GitHub / Sursă",
    legalDisclaimer: "Neafiliat cu OpenAI.",
    availableOnAllMajorBrowsers: "Disponibil pe toate browserele majore"
  },
  seo: {
    defaultTitle: "Sidecar pentru ChatGPT: dock-ul de productivitate suprem",
    defaultDescription: "Îmbunătățește ChatGPT cu un dock nativ în bara laterală, mod lat, comenzi macro și urmărire în timp real a tokenurilor. Extensia esențială pentru utilizatori avansați."
  },
  nav: {
    features: "Funcționalități",
    macros: "Macro-uri",
    roadmap: "Roadmap",
    testimonials: "Testimoniale",
    github: "GitHub / Sursă"
  },
  stats: {
    activeUsers: "Utilizatori activi",
    promptsSaved: "Prompturi salvate",
    tokensTracked: "Tokenuri urmărite",
    rating: "Evaluare",
    timeSaved: "Timp economisit",
    promptLibrary: "Bibliotecă de prompturi",
    privacyFocus: "Accent pe confidențialitate",
    betaStatus: "Status beta",
    suffixPerWeek: "h/săpt",
    noteProjected: "estimat per utilizator",
    noteTemplates: "șabloane incluse",
    noteLocalStorage: "doar stocare locală",
    notePublicPreview: "previzualizare publică disponibilă"
  },
  featuresHeader: {
    headline: "Instrumente puternice pentru utilizatori puternici",
    subhead: "Tot ce ai nevoie pentru a gestiona conversațiile AI mai eficient, construit direct în interfața pe care o folosești deja."
  },
  features: [
    {
      title: "Dock inteligent",
      description: "Un dock persistent în bara laterală pentru acces instant la instrumentele și setările preferate fără a aglomera UI-ul."
    },
    {
      title: "Comutare bară laterală",
      description: "Comută fără efort bara laterală a conversației pentru a te concentra pe conținut."
    },
    {
      title: "Mod lat",
      description: "Eliberează-te de vizualizarea îngustă centrată. Extinde conversația pe toată lățimea ecranului."
    },
    {
      title: "Control input",
      description: "Redimensionează sau restrânge zona de input pentru a vedea mai mult din istoricul conversației."
    },
    {
      title: "Superputeri pentru cod",
      description: "Blocuri de cod pliabile pentru lizibilitate mai bună și previzualizări HTML instantanee."
    },
    {
      title: "Bibliotecă de prompturi",
      description: "Salvează prompturi frecvente și accesează instant istoricul recent. Fără reintroducerea aceluiași context."
    },
    {
      title: "Bară de stare în timp real",
      description: "Urmărire în timp real a tokenurilor, numărului de cuvinte și costurilor API estimate."
    },
    {
      title: "Comutator de model",
      description: "Selectorul de modele mutat în dock pentru schimbare mai rapidă între modele."
    },
    {
      title: "Tipografie personalizată",
      description: "Personalizează experiența de citire schimbând fonturile în Sistem sau Google Fonts."
    },
    {
      title: "Config complet",
      description: "Personalizare profundă a comportamentului extensiei cu import/export pentru setări."
    }
  ],
  howItWorks: {
    headline: "Cum funcționează",
    subhead: "Trei pași. Dramă minimă. Browserul tău îți mulțumește.",
    steps: [
      {
        title: "Instalează din magazinul tău",
        body: "Adaugă Sidecar din Chrome Web Store, Edge Add-ons sau Firefox Add-ons. (Linkurile sunt substituenți până la lansare.)",
        icon: "Download"
      },
      {
        title: "Activează-l pe ChatGPT",
        body: "Deschide ChatGPT și activează Sidecar. Dacă este activat, este disponibil. Nu este necesar niciun ritual de fixare.",
        icon: "ToggleRight"
      },
      {
        title: "Rulează macro-uri + comenzi",
        body: "Folosește Ctrl+K pentru a deschide paleta de comenzi. Salvează macro-uri, redă fluxuri și ține mâinile pe tastatură.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Macro-uri care chiar ajută",
    subhead: "O paletă de comenzi + magazin de macro-uri conceput pentru a automatiza fluxul de lucru fără a deturna compozitorul ChatGPT.",
    items: [
      {
        title: "Paleta de comenzi (Ctrl+K)",
        body: "Tastează comenzi doar în intrarea paletei Sidecar. Fără hack-uri slash-command în compozitorul nativ, fără rupere IME.",
        icon: "Command"
      },
      {
        title: "Macro-uri + Scripturi Flow",
        body: "Salvează, partajează, publică și rulează scripturi de automatizare macro care alimentează motorul tău Flow (flow.ts).",
        icon: "Workflow"
      },
      {
        title: "Istoric tip terminal",
        body: "Sus/Jos parcurge comenzile tale recente ca un shell. Persistent în chrome.storage.local și limitat pentru a păstra sănătatea.",
        icon: "History"
      },
      {
        title: "Estimări token-uri, leneș",
        body: "Cache pe fir, reîmprospătare în timpul inactiv și evită re-tokenizarea universului la fiecare mutație.",
        icon: "Gauge"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Beta tester",
      quote: "Modul lat mi-a schimbat total modul de a citi fragmente de cod. Gata cu derularea orizontală."
    },
    {
      name: "Sarah K.",
      role: "Beta tester",
      quote: "Îmi place că macro-urile sunt stocate local. În sfârșit, un instrument care respectă confidențialitatea."
    },
    {
      name: "Devin R.",
      role: "Acces timpuriu",
      quote: "Contorul de tokenuri din dock schimbă regulile jocului pentru gestionarea ferestrei de context API."
    }
  ],
  secondaryFeatures: {
    title: "Mai mult decât un dock",
    vscodePets: {
      title: "VS Code Pets",
      description: "Adu bucurie în fluxul de lucru cu animalele tale preferate din VS Code în bara laterală."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Urmărește automat statisticile și progresul RPG în timp ce conversezi și finalizezi sarcini."
    },
    downloads: {
      title: "Descărcări modulare",
      description: "Personalizează instalarea Sidecar. Selectează doar componentele necesare pentru a păstra amprenta mică.",
      totalSize: "Dimensiune totală instalare",
      download: "Descarcă selecțiile",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Funcționalități esențiale de runtime și dock.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Însoțitori virtuali pentru bara laterală.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "Tracker pentru progres RPG.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Analitice locale",
          description: "Grafice avansate și procesare statistici de utilizare.",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "Bucăți de roadmap (grămada 'bine de avut')",
    subhead: "Câteva dintre actualizările mai mari care se potrivesc specificațiilor tale. Acestea sunt puncte de pagină de destinație, nu promisiuni.",
    items: [
      {
        title: "Curățare titlu pagină",
        body: "Elimină 'ChatGPT - ' din titlul filei când rulează în contextul extensiei."
      },
      {
        title: "UX Popover",
        body: "Popover-ele se închid la clic în afară și la acțiuni în interiorul lor."
      },
      {
        title: "Animație mâner de prindere",
        body: "Micro-mâner drăguț care se extinde la trecerea mouse-ului și se animă lin."
      },
      {
        title: "Rechemare prompt în compozitor",
        body: "Săgeată sus previzualizează prompt-uri recente; Săgeată dreapta introduce prompt-ul complet."
      },
      {
        title: "Protecții scroll + mod lat",
        body: "Oprește derularea automată la bază opțional; repară depășirea modului lat pe prompt-uri lungi."
      },
      {
        title: "Colapsare mesaje",
        body: "Colapsează chat-uri lungi cu previzualizare + număr caractere; auto-colapsare la trimitere peste X caractere."
      },
      {
        title: "Blocurile tale de cod",
        body: "Detectează ``` în mesajele tale, randează blocuri stilizate, evidențiere sintaxă, clic pentru copiere."
      },
      {
        title: "Scalare font",
        body: "Scalează interfața Sidecar fără a schimba zoom-ul browserului."
      }
    ]
  },
  ctaSection: {
    headline: "Gata să îți upgradezi fluxul de lucru?",
    body: "Construiește-l în public, livrează-l rapid și lasă utilizatorii să îl împingă spre măreție."
  },
  stores: {
    chrome: {
      ariaLabel: "Disponibil în Chrome Web Store",
      availableIn: "Disponibil în",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Disponibil pe Microsoft Edge Add-ons",
      availableOn: "Disponibil pe",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Obține add-on-ul pentru Firefox",
      getAddon: "Obține add-on-ul",
      forFirefox: "pentru Firefox"
    }
  },
  legal: {
    privacyTitle: "Politica de confidențialitate",
    termsTitle: "Termeni de serviciu",
    effectiveDate: "Data intrării în vigoare"
  },
  footer: {
    product: "Produs",
    legal: "Legal",
    statusOperational: "Toate sistemele operaționale"
  },
  faqSection: {
    headline: "Întrebări frecvente",
    subhead: "Tot ce trebuie să știi despre Sidecar și compatibilitatea extensiilor de browser"
  },
  faqs: [
    {
      question: "Ce este Sidecar pentru ChatGPT?",
      answer: "Sidecar este o cutie de instrumente de productivitate și un dock care îmbunătățește experiența în ChatGPT cu bară laterală persistentă, mod lat, urmărire tokenuri, macro-uri și instrumente de cod — toate integrate în interfață."
    },
    {
      question: "Sidecar este gratuit?",
      answer: "Da, Sidecar este complet gratuit și open source. Credem că instrumentele de productivitate ar trebui să fie accesibile tuturor."
    },
    {
      question: "Sidecar funcționează cu toate modelele ChatGPT?",
      answer: "Da! Sidecar este compatibil cu toate modelele, inclusiv GPT-4 și GPT-3.5, îmbunătățind interfața indiferent de model."
    },
    {
      question: "Cum îmi gestionează Sidecar datele?",
      answer: "Toate datele tale (prompturi, setări, macro-uri) sunt stocate local pe dispozitiv. Nu colectăm informații personale și nu îți urmărim utilizarea."
    },
    {
      question: "Ce funcționalități are Sidecar?",
      answer: "Sidecar include dock inteligent, mod lat, urmărire tokenuri în timp real, bibliotecă de prompturi, blocuri de cod pliabile, comutator de model și tipografie personalizabilă."
    },
    {
      question: "Cum instalez Sidecar?",
      answer: "Instalează extensia din Chrome Web Store sau Firefox Add-ons. După instalare, Sidecar se integrează automat cu ChatGPT."
    }
  ]
};
