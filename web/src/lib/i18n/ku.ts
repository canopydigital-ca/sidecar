import type { Translation } from './types';
// get version from package.json


export const ku: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar ji bo ChatGPT: Sindoka Amûran + Dock",
    tagline: "Sindoka amûran û dockek ku ChatGPT bêyî tevliheviyê nûjen dike.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} niha heye`,
    heroHeadline: "Ezmûna xwe ya",
    heroAccent: "Chatê Zêde Bike",
    heroBody: "Sidecar sindoka hilberîneriyê ya ji bo ChatGPT ye: dockek jîr, moda fireh, şopandina tokenan, makro, û amûrên kodê ku rasterast di navbeynkara we de hatine avakirin.",
    ctaPrimary: "Sidecar Saz Bike",
    ctaSecondary: "GitHub / Çavkanî Binêre",
    legalDisclaimer: "Bi OpenAI ve ne girêdayî ye.",
    availableOnAllMajorBrowsers: "Li ser hemî gerokên sereke heye",
    demoBanner: "Demo zindî biceribînin ->"
  },
  seo: {
    defaultTitle: "Sidecar ji bo ChatGPT: Docka Hilberîneriyê ya Dawîn",
    defaultDescription: "ChatGPT bi dockek kêlekê ya xwemalî, moda fireh, fermanên makro, û şopandina tokenan a di dema rast de nûjen bikin. Pêvekek gerokê ya bingehîn ji bo bikarhênerên hêzdar."
  },
  nav: {
    features: "Taybetmendî",
    macros: "Makro",
    roadmap: "Nexşerê",
    testimonials: "Şahidî",
    github: "GitHub / Çavkanî"
  },
  stats: {
    activeUsers: "Bikarhênerên Çalak",
    promptsSaved: "Promptên Tomarkirî",
    tokensTracked: "Tokenên Şopandî",
    rating: "Nirxandin",
    timeSaved: "Dema Tomarkirî",
    promptLibrary: "Pirtûkxaneya Promptan",
    privacyFocus: "Baldariya Taybetiyê",
    betaStatus: "Rewşa Beta",
    suffixPerWeek: "s/hefte",
    noteProjected: "texmînkirî ji bo her bikarhênerekî",
    noteTemplates: "şablon tê de ne",
    noteLocalStorage: "tenê hilanîna herêmî",
    notePublicPreview: "pêşdîtina giştî heye"
  },
  featuresHeader: {
    headline: "Amûrên hêzdar ji bo bikarhênerên hêzdar",
    subhead: "Her tiştê ku hûn hewce ne ji bo birêvebirina danûstandinên xwe yên AI bi bandortir, rasterast di navbeynkara ku hûn jixwe bikar tînin de hatî avakirin."
  },
  features: [
    {
      title: "Docka Jîr",
      description: "Dockek kêlekê ya domdar ji bo gihîştina bilez a amûr û mîhengên weyên bijare bêyî tevlihevkirina UI."
    },
    {
      title: "Guherîna Kêlekê",
      description: "Kêlekê danûstandinê bi hêsanî vekin/bigirin da ku tenê li ser naveroka chata xwe hûr bibin."
    },
    {
      title: "Moda Fireh",
      description: "Ji dîmena teng a navendî rizgar bibin. Danûstandinê fireh bikin da ku tevahiya firehiya ekrana xwe bikar bînin."
    },
    {
      title: "Kontrola Ketinê",
      description: "Qada ketinê mezin bikin an biçûk bikin da ku bêtir dîroka danûstandinê bi carekê bibînin."
    },
    {
      title: "Hêzên Kodê",
      description: "Blokên kodê yên vekirî/girtî ji bo xwendina çêtir û pêşdîtinên HTML-ê yên bilez."
    },
    {
      title: "Pirtûkxaneya Promptan",
      description: "Promptên ku pir têne bikar anîn tomar bikin û tavilê bigihîjin dîroka xwe ya dawî. Qet heman naverokê ji nû ve nenivîsin."
    },
    {
      title: "Barê Rewşa Zindî",
      description: "Şopandina rast-dem a karanîna tokenan, hejmara peyvan, û lêçûnên texmînkirî yên API-yê bi yek nêrînê."
    },
    {
      title: "Guherînerê Modelê",
      description: "Hilbijêrê modelê yê di dockê de ji bo guheztina zûtir a di navbera modelan de."
    },
    {
      title: "Tîpografiya Taybet",
      description: "Ezmûna xwendina xwe bi guheztina malbatên fontê li System an Google Fonts kesane bikin."
    },
    {
      title: "Mîhenga Tam",
      description: "Xwerûkirina kûr a tevgera pêvekê bi şiyanên import/export ji bo mîhengên we."
    }
  ],
  howItWorks: {
    headline: "Çawa dixebite",
    subhead: "Sê gav. Kêmtirîn drama. Geroka we spasiya we dike.",
    steps: [
      {
        title: "Ji dikana xwe saz bikin",
        body: "Sidecar ji Chrome Web Store, Edge Add-ons, an Firefox Add-ons zêde bikin. (Girêdan heta weşanê cîhgiran in.)",
        icon: "Download"
      },
      {
        title: "Li ser ChatGPT çalak bikin",
        body: "ChatGPT vekin û Sidecar çalak bikin. Ger çalak be, ew li wir e. Tu rîtûelên rastkirinê ne hewce ne.",
        icon: "ToggleRight"
      },
      {
        title: "Makro + fermanan bimeşînin",
        body: "Ctrl+K bikar bînin da ku paleta fermanê vekin. Makroyan tomar bikin, herikînê dubare bikin, û destên xwe li ser klavyeyê bihêlin.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Makroyên ku bi rastî alîkariyê dikin",
    subhead: "Paletek fermanê + dikana makroyan ku ji bo otomatîkkirina xebata we hatî sêwirandin bêyî ku destwerdana nivîskarê ChatGPT bike.",
    items: [
      {
        title: "Paleta Fermanê (Ctrl+K)",
        body: "Fermanan tenê di ketina paleta Sidecar de binivîsin. Di nivîskarê xwemalî de ti hackên slash-command, ti şikestina IME tune.",
        icon: "Command"
      },
      {
        title: "Makro + Skrîptên Herikînê",
        body: "Skrîptên otomatîkkirina makroyan ên ku di motora Flow (flow.ts) ya we de dixwin tomar bikin, parve bikin, biweşînin û bimeşînin.",
        icon: "Workflow"
      },
      {
        title: "Dîroka Wekî Termînalê",
        body: "Jor/Jêr fermanên weyên dawî mîna şellekê diqulipîne. Di chrome.storage.local de tê hilanîn û ji bo maqûl bimîne tê sînorkirin.",
        icon: "History"
      },
      {
        title: "Texmînên tokenan, bi tembelî",
        body: "Ji bo her mijarê cache, di dema betal de nûvekirin, û ji nû ve tokenîzekirina gerdûnê li ser her guhertinê dûr bixin.",
        icon: "Gauge"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Beta Tester",
      quote: "Moda fireh bi tevahî awayê xwendina min a perçeyên kodê guherand. Êdî dînîtiya gerandina asoyî tune."
    },
    {
      name: "Sarah K.",
      role: "Beta Tester",
      quote: "Ez hez dikim ku makroyên min li herêmî têne hilanîn. Di dawiyê de, amûrek hilberîneriyê ku rêzê li nepeniya min digire."
    },
    {
      name: "Devin R.",
      role: "Gihîştina Zû",
      quote: "Hejmarê tokenan di dockê de ji bo birêvebirina pencereya çarçoveya API-ya min guhertinek lîstikê ye."
    }
  ],
  secondaryFeatures: {
    title: "Zêdetirî tenê dockek",
    vscodePets: {
      title: "Heywanên VS Code",
      description: "Bi heywanên xweyên bijare yên VS Code re ku di kêleka we de dijîn, şahiyê bînin xebata xwe."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Dema ku hûn sohbet dikin û peywiran temam dikin, statîstîk û pêşveçûna xwe ya RPG bixweber bişopînin."
    },
    downloads: {
      title: "Daxistinên Modular",
      description: "Sazkirina Sidecar-a xwe xweş bikin. Parçeyên ku hûn hewce ne hilbijêrin da ku şopa xwe piçûk bihêlin.",
      totalSize: "Mezinahiya Giştî ya Sazkirinê",
      download: "Yên Hilbijartî Daxistin",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Fonksiyona bingehîn a runtime û dockê.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "Heywanên VS Code",
          description: "Hevalên virtual ji bo kêleka we.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "Şopînerê pergala pêşveçûna RPG.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Analîzên Herêmî",
          description: "Tabloyên pêşkeftî û pêvajoya statîstîkên karanînê.",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "Parçeyên nexşerêyê (yên \"baş e hebe\")",
    subhead: "Çend nûvekirinên mezintir ku li gorî taybetmendiya we ne. Ev xalên rûpelê dakêşanê ne, ne soz in.",
    items: [
      {
        title: "Paqijkirina sernavê rûpelê",
        body: "Dema ku di çarçoveya pêvekê de tê xebitandin, \"ChatGPT - \" ji sernavê tabê derxînin."
      },
      {
        title: "UX Popover",
        body: "Popover li ser klîka derve û li ser çalakiyên hundurê wan digirin."
      },
      {
        title: "Anîmasyona destikê girtinê",
        body: "Destikê mîkro yê şirîn ku li ser hoverê fireh dibe û bi nermî anîmasyon dibe."
      },
      {
        title: "Bibîranîna promptê di nivîskar de",
        body: "Tîra jor promptên dawî pêşdîtin dike; Tîra rastê prompta tevahî têxe."
      },
      {
        title: "Gerandin + parastinên moda fireh",
        body: "Bijartina rawestandina gerandina xweser a ber bi jêr; rastkirina zêdebûna moda fireh li ser promptên dirêj."
      },
      {
        title: "Hilweşîna peyaman",
        body: "Chatên dirêj bi pêşdîtin + hejmara tîpan hilweşînin; hilweşîna xweser li ser şandina zêdetirî X tîpan."
      },
      {
        title: "Blokên kodê yên we",
        body: "Di peyamên xwe de ``` bibînin, blokên stîlkirî render bikin, ronîkirina hevoksaziyê, klîk-bo-kopîkirin."
      },
      {
        title: "Mezinbûna fontê",
        body: "UI-ya Sidecar bêyî guheztina zooma gerokê mezin bikin."
      }
    ]
  },
  ctaSection: {
    headline: "Amade ne ku xebata xwe nûjen bikin?",
    body: "Wê li ber çavan ava bikin, zû bişînin, û bihêlin bikarhênerên we wê berbi mezinbûnê ve bibin."
  },
  stores: {
    chrome: {
      ariaLabel: "Li Chrome Web Store heye",
      availableIn: "Li vir heye",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Li Microsoft Edge Add-ons heye",
      availableOn: "Li ser heye",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Pêvekê ji bo Firefox bistînin",
      getAddon: "Pêvekê bistînin",
      forFirefox: "ji bo Firefox"
    }
  },
  legal: {
    privacyTitle: "Siyaseta Taybetiyê",
    termsTitle: "Mercên Karûbar",
    effectiveDate: "Dîroka bandorê"
  },
  footer: {
    product: "Hilber",
    legal: "Yasayî",
    statusOperational: "Hemî pergal dixebitin"
  },
  faqSection: {
    headline: "Pirsên Pir Têne Pirsîn",
    subhead: "Her tiştê ku hûn hewce ne li ser Sidecar û lihevhatina pêveka gerokê zanibin"
  },
  faqs: [
    {
      question: "Sidecar ji bo ChatGPT çi ye?",
      answer: "Sidecar sindokek hilberîneriyê û dockek e ku ezmûna weya ChatGPT bi taybetmendiyên mîna kêleka domdar, moda fireh, şopandina tokenan, makro, û amûrên kodê zêde dike - hemî rasterast di navbeynkara weya ChatGPT de hatine avakirin."
    },
    {
      question: "Ma Sidecar belaş e?",
      answer: "Erê, Sidecar bi tevahî belaş û çavkaniya vekirî ye. Em bawer dikin ku amûrên hilberîneriyê divê bêyî astengiyên lêçûnê ji her kesî re bigihîjin."
    },
    {
      question: "Ma Sidecar bi hemî modelên ChatGPT re dixebite?",
      answer: "Erê! Sidecar bi hemî modelên ChatGPT re, tevî GPT-4, GPT-3.5, û her modelên pêşerojê re hevaheng e. Pêvek bêyî ku hûn kîjan modelê bikar bînin navbeynkarê zêde dike."
    },
    {
      question: "Sidecar daneyên min çawa digire?",
      answer: "Hemî daneyên we (prompt, mîheng, makro) li ser cîhaza we herêmî têne hilanîn. Em tu agahdariya kesane berhev nakin an karanîna we naşopînin. Taybetiya we pêşengiya me ye."
    },
    {
      question: "Sidecar çi taybetmendiyan pêşkêşî dike?",
      answer: "Sidecar dockek kêlekê ya jîr, moda fireh ji bo dîtina berfireh, şopandina tokenan a rast-dem, pirtûkxaneya promptan, amûrên kodê bi blokên hilweşînbar, guherînerê modelê, û tîpografiya xwerû vedihewîne - hemî ji bo nûjenkirina xebata weya ChatGPT hatine sêwirandin."
    },
    {
      question: "Ez çawa Sidecar saz dikim?",
      answer: "Tenê pêveka gerokê ji Chrome Web Store an Firefox Add-ons saz bikin. Piştî sazkirinê, Sidecar dê bixweber bi ChatGPT re yek bibe û ezmûna we bi taybetmendiyên xwe yên hilberîneriyê zêde bike."
    }
  ]
};
