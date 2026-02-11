import type { Translation } from './types';
// get version from package.json


export const fr: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar pour ChatGPT : Boîte à outils + Dock",
    tagline: "Une boîte à outils et un dock qui améliorent ChatGPT sans encombrement.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} est maintenant disponible`,
    heroHeadline: "Boostez votre",
    heroAccent: "expérience de chat",
    heroBody: "Sidecar est la boîte à outils de productivité pour ChatGPT : un dock intelligent, un mode large, le suivi des tokens, des macros et des outils de code intégrés directement à votre interface.",
    ctaPrimary: "Installer Sidecar",
    ctaSecondary: "Voir GitHub / Source",
    legalDisclaimer: "Non affilié à OpenAI.",
    availableOnAllMajorBrowsers: "Disponible sur tous les principaux navigateurs",
    demoBanner: "Essayez la démo en direct ->"
  },
  seo: {
    defaultTitle: "Sidecar pour ChatGPT : le dock de productivité ultime",
    defaultDescription: "Améliorez ChatGPT avec un dock latéral natif, un mode large, des commandes macro et un suivi des tokens en temps réel. L’extension essentielle pour les utilisateurs avancés."
  },
  nav: {
    features: "Fonctionnalités",
    macros: "Macros",
    roadmap: "Feuille de route",
    testimonials: "Témoignages",
    github: "GitHub / Code"
  },
  stats: {
    activeUsers: "Utilisateurs actifs",
    promptsSaved: "Prompts enregistrés",
    tokensTracked: "Tokens suivis",
    rating: "Note",
    timeSaved: "Temps économisé",
    promptLibrary: "Bibliothèque de prompts",
    privacyFocus: "Respect de la vie privée",
    betaStatus: "Statut bêta",
    suffixPerWeek: "h/sem",
    noteProjected: "projection par utilisateur",
    noteTemplates: "modèles inclus",
    noteLocalStorage: "stockage local uniquement",
    notePublicPreview: "aperçu public disponible"
  },
  featuresHeader: {
    headline: "Des outils puissants pour des utilisateurs exigeants",
    subhead: "Tout ce dont vous avez besoin pour gérer vos conversations IA plus efficacement, intégré directement dans l'interface que vous utilisez déjà."
  },
  features: [
    {
      title: "Dock intelligent",
      description: "Un dock latéral persistant pour un accès instantané à vos outils et réglages favoris sans encombrer l’interface."
    },
    {
      title: "Basculer la barre latérale",
      description: "Basculez facilement la barre latérale de conversation pour vous concentrer uniquement sur votre contenu."
    },
    {
      title: "Mode large",
      description: "Libérez-vous de la vue centrée étroite. Étendez la conversation pour utiliser toute la largeur de votre écran."
    },
    {
      title: "Contrôle de l’entrée",
      description: "Redimensionnez ou réduisez la zone de saisie pour voir davantage d’historique de conversation."
    },
    {
      title: "Superpouvoirs du code",
      description: "Blocs de code repliables pour une meilleure lisibilité et aperçus HTML instantanés pour les développeurs web."
    },
    {
      title: "Bibliothèque de prompts",
      description: "Enregistrez vos prompts fréquents et accédez à votre historique récent instantanément. Ne retapez plus le même contexte."
    },
    {
      title: "Barre d’état en direct",
      description: "Suivi en temps réel des tokens, du nombre de mots et des coûts estimés de l’API en un coup d’œil."
    },
    {
      title: "Sélecteur de modèle",
      description: "Sélecteur de modèle placé dans le dock pour basculer plus rapidement entre les modèles."
    },
    {
      title: "Typographie personnalisée",
      description: "Personnalisez votre lecture en changeant les familles de polices vers Système ou Google Fonts."
    },
    {
      title: "Configuration complète",
      description: "Personnalisation approfondie du comportement de l’extension avec import/export de vos paramètres."
    }
  ],
  howItWorks: {
    headline: "Comment ça marche",
    subhead: "Trois étapes. Un minimum de tracas. Votre navigateur vous remerciera.",
    steps: [
      {
        title: "Installer depuis votre boutique",
        body: "Ajoutez Sidecar depuis le Chrome Web Store, Edge Add-ons ou Firefox Add-ons. (Les liens sont des espaces réservés jusqu'à la publication.)",
        icon: "Download"
      },
      {
        title: "Activez-le sur ChatGPT",
        body: "Ouvrez ChatGPT et activez Sidecar. S'il est activé, il est disponible. Aucun rituel d'épinglage requis.",
        icon: "ToggleRight"
      },
      {
        title: "Exécutez des macros + commandes",
        body: "Utilisez Ctrl+K pour ouvrir la palette de commandes. Enregistrez des macros, rejouez des flux et gardez les mains sur le clavier.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Des macros qui aident vraiment",
    subhead: "Une palette de commandes + un magasin de macros conçus pour automatiser votre flux de travail sans détourner le compositeur de ChatGPT.",
    items: [
      {
        title: "Palette de commandes (Ctrl+K)",
        body: "Tapez des commandes uniquement dans la palette de Sidecar. Pas de hacks slash-command dans le compositeur natif, pas de rupture IME.",
        icon: "Command"
      },
      {
        title: "Macros + Scripts de flux",
        body: "Enregistrez, partagez, publiez et exécutez des scripts d'automatisation de macros qui alimentent votre moteur de flux (flow.ts).",
        icon: "Workflow"
      },
      {
        title: "Historique de type terminal",
        body: "Haut/Bas fait défiler vos commandes récentes comme un shell. Persistant dans chrome.storage.local et plafonné pour rester raisonnable.",
        icon: "History"
      },
      {
        title: "Estimations de tokens, paresseusement",
        body: "Mise en cache par fil, rafraîchissement pendant le temps d'inactivité et évite de re-tokeniser l'univers à chaque mutation.",
        icon: "Gauge"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Testeur bêta",
      quote: "Le mode large a complètement changé ma façon de lire le code. Fini la folie du défilement horizontal."
    },
    {
      name: "Sarah K.",
      role: "Testeur bêta",
      quote: "J’adore que mes macros soient stockées localement. Enfin, un outil de productivité qui respecte ma vie privée."
    },
    {
      name: "Devin R.",
      role: "Accès anticipé",
      quote: "Le compteur de tokens dans le dock change la donne pour gérer la fenêtre de contexte d’API."
    }
  ],
  secondaryFeatures: {
    title: "Plus qu’un simple dock",
    vscodePets: {
      title: "VS Code Pets",
      description: "Apportez de la joie à votre flux de travail avec vos animaux VS Code préférés vivant dans votre barre latérale."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Suivez automatiquement vos statistiques RPG et votre progression en discutant et en accomplissant des tâches."
    },
    downloads: {
      title: "Téléchargements modulaires",
      description: "Personnalisez votre installation Sidecar. Sélectionnez les composants dont vous avez besoin pour garder une empreinte minimale.",
      totalSize: "Taille totale de l’installation",
      download: "Télécharger la sélection",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Fonctionnalité essentielle d’exécution et du dock.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "VS Code Pets",
          description: "Compagnons virtuels pour votre barre latérale.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "Suivi du système de progression RPG.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Analyses locales",
          description: "Graphiques avancés et traitement des statistiques.",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "Feuille de route (la pile « sympa à avoir »)",
    subhead: "Quelques-unes des plus grandes mises à jour qui correspondent à vos spécifications. Ce sont des points de page de destination, pas des promesses.",
    items: [
      {
        title: "Nettoyage du titre de la page",
        body: "Supprimer « ChatGPT - » du titre de l'onglet lors de l'exécution dans le contexte de l'extension."
      },
      {
        title: "UX Popover",
        body: "Les popovers se ferment au clic extérieur et sur les actions à l'intérieur."
      },
      {
        title: "Animation de la poignée de saisie",
        body: "Micro-poignée mignonne qui s'agrandit au survol et s'anime en douceur."
      },
      {
        title: "Rappel de prompt dans le compositeur",
        body: "Flèche haut prévisualise les prompts récents ; Flèche droite insère le prompt complet."
      },
      {
        title: "Protections défilement + mode large",
        body: "Arrêter le défilement automatique vers le bas en option ; corriger le débordement du mode large sur les longs prompts."
      },
      {
        title: "Réduction des messages",
        body: "Réduire les longs chats avec aperçu + nombre de caractères ; réduction automatique à l'envoi de plus de X caractères."
      },
      {
        title: "Vos blocs de code",
        body: "Détecter ``` dans vos messages, rendre des blocs stylisés, coloration syntaxique, cliquer pour copier."
      },
      {
        title: "Mise à l'échelle de la police",
        body: "Mettre à l'échelle l'interface utilisateur de Sidecar sans changer le zoom du navigateur."
      }
    ]
  },
  ctaSection: {
    headline: "Prêt à améliorer votre flux de travail ?",
    body: "Construisez-le en public, expédiez-le rapidement et laissez vos utilisateurs le pousser vers l'excellence."
  },
  stores: {
    chrome: {
      ariaLabel: "Disponible dans le Chrome Web Store",
      availableIn: "Disponible dans le",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Disponible sur les modules complémentaires Microsoft Edge",
      availableOn: "Disponible sur",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Obtenir l'extension pour Firefox",
      getAddon: "Obtenir l'extension",
      forFirefox: "pour Firefox"
    }
  },
  legal: {
    privacyTitle: "Politique de confidentialité",
    termsTitle: "Conditions d’utilisation",
    effectiveDate: "Date d’entrée en vigueur"
  },
  footer: {
    product: "Produit",
    legal: "Juridique",
    statusOperational: "Tous les systèmes opérationnels"
  },
  faqSection: {
    headline: "Foire aux questions",
    subhead: "Tout ce que vous devez savoir sur Sidecar et la compatibilité des extensions de navigateur"
  },
  faqs: [
    {
      question: "Qu’est-ce que Sidecar pour ChatGPT ?",
      answer: "Sidecar est une boîte à outils de productivité et un dock qui améliore votre expérience avec ChatGPT grâce à une barre latérale persistante, un mode large, le suivi des tokens, des macros et des outils de code — le tout intégré directement à votre interface."
    },
    {
      question: "Sidecar est-il gratuit ?",
      answer: "Oui, Sidecar est totalement gratuit et open source. Nous pensons que les outils de productivité doivent être accessibles à tous sans barrière de coût."
    },
    {
      question: "Sidecar fonctionne-t-il avec tous les modèles de ChatGPT ?",
      answer: "Oui ! Sidecar est compatible avec tous les modèles ChatGPT, y compris GPT-4, GPT-3.5 et futurs modèles. L’extension améliore l’interface quelle que soit votre sélection."
    },
    {
      question: "Comment Sidecar gère-t-il mes données ?",
      answer: "Toutes vos données (prompts, réglages, macros) sont stockées localement sur votre appareil. Nous ne collectons aucune information personnelle et ne suivons pas votre utilisation. Votre confidentialité est notre priorité."
    },
    {
      question: "Quelles fonctionnalités offre Sidecar ?",
      answer: "Sidecar comprend un dock latéral intelligent, un mode large, le suivi des tokens en temps réel, une bibliothèque de prompts, des blocs de code repliables, un sélecteur de modèle et une typographie personnalisable — tout pour booster votre flux de travail."
    },
    {
      question: "Comment installer Sidecar ?",
      answer: "Installez simplement l’extension à partir du Chrome Web Store ou des modules complémentaires Firefox. Une fois installée, Sidecar s’intègre automatiquement à ChatGPT et améliore votre expérience."
    }
  ]
};
