import type { Translation } from './types';
// get version from package.json


export const pt: Translation = {
  site: {
    brand: "Sidecar",
    storeTitle: "Sidecar para ChatGPT: Caixa de ferramentas + Dock",
    tagline: "Uma caixa de ferramentas e um dock que melhoram o ChatGPT sem poluição visual.",
    versionBadge: `Sidecar v${__SIDECAR_VERSION__} já está disponível`,
    heroHeadline: "Potencie sua",
    heroAccent: "experiência de chat",
    heroBody: "Sidecar é a caixa de ferramentas de produtividade para o ChatGPT: um dock inteligente, modo amplo, rastreamento de tokens, macros e ferramentas de código integradas diretamente na interface.",
    ctaPrimary: "Instalar Sidecar",
    ctaSecondary: "Ver GitHub / Código",
    legalDisclaimer: "Não afiliado à OpenAI.",
    availableOnAllMajorBrowsers: "Disponível em todos os principais navegadores"
  },
  seo: {
    defaultTitle: "Sidecar para ChatGPT: o dock de produtividade definitivo",
    defaultDescription: "Melhore o ChatGPT com um dock lateral nativo, modo amplo, comandos de macro e rastreamento de tokens em tempo real. A extensão essencial para usuários avançados."
  },
  nav: {
    features: "Funcionalidades",
    macros: "Macros",
    roadmap: "Roteiro",
    testimonials: "Depoimentos",
    github: "GitHub / Código"
  },
  stats: {
    activeUsers: "Usuários ativos",
    promptsSaved: "Prompts salvos",
    tokensTracked: "Tokens rastreados",
    rating: "Avaliação",
    timeSaved: "Tempo economizado",
    promptLibrary: "Biblioteca de prompts",
    privacyFocus: "Foco em privacidade",
    betaStatus: "Status beta",
    suffixPerWeek: "h/sem",
    noteProjected: "projetado por usuário",
    noteTemplates: "modelos incluídos",
    noteLocalStorage: "apenas armazenamento local",
    notePublicPreview: "prévia pública disponível"
  },
  featuresHeader: {
    headline: "Ferramentas poderosas para usuários avançados",
    subhead: "Tudo o que você precisa para gerenciar suas conversas de IA de forma mais eficaz, integrado diretamente na interface que você já usa."
  },
  features: [
    {
      title: "Dock inteligente",
      description: "Um dock lateral persistente para acesso instantâneo às suas ferramentas e configurações favoritas sem poluir a interface."
    },
    {
      title: "Alternar barra lateral",
      description: "Alterne facilmente a barra lateral para focar apenas no conteúdo da conversa."
    },
    {
      title: "Modo amplo",
      description: "Saia da visão centrada e estreita. Expanda a conversa para usar toda a largura da tela."
    },
    {
      title: "Controle de entrada",
      description: "Redimensione ou recolha a área de entrada para ver mais histórico da conversa."
    },
    {
      title: "Superpoderes de código",
      description: "Blocos de código recolhíveis para melhor legibilidade e pré-visualizações HTML instantâneas."
    },
    {
      title: "Biblioteca de prompts",
      description: "Salve prompts frequentes e acesse instantaneamente o histórico recente. Chega de repetir."
    },
    {
      title: "Barra de status em tempo real",
      description: "Rastreamento em tempo real de tokens, contagem de palavras e custos estimados de API."
    },
    {
      title: "Seletor de modelo",
      description: "Seletor de modelo no dock para alternar mais rápido entre modelos."
    },
    {
      title: "Tipografia personalizada",
      description: "Personalize a leitura alterando famílias de fontes para Sistema ou Google Fonts."
    },
    {
      title: "Configuração completa",
      description: "Personalização profunda do comportamento da extensão com importação/exportação de configurações."
    }
  ],
  howItWorks: {
    headline: "Como funciona",
    subhead: "Três passos. Mínimo drama. Seu navegador agradece.",
    steps: [
      {
        title: "Instalar da sua loja",
        body: "Adicione o Sidecar da Chrome Web Store, Edge Add-ons ou Firefox Add-ons. (Os links são espaços reservados até o lançamento.)",
        icon: "Download"
      },
      {
        title: "Ative no ChatGPT",
        body: "Abra o ChatGPT e ative o Sidecar. Se estiver ativado, está disponível. Nenhum ritual de fixação necessário.",
        icon: "ToggleRight"
      },
      {
        title: "Execute macros + comandos",
        body: "Use Ctrl+K para abrir a paleta de comandos. Salve macros, reproduza fluxos e mantenha as mãos no teclado.",
        icon: "Command"
      }
    ]
  },
  macrosSection: {
    headline: "Macros que realmente ajudam",
    subhead: "Uma paleta de comandos + loja de macros projetada para automatizar seu fluxo de trabalho sem sequestrar o compositor do ChatGPT.",
    items: [
      {
        title: "Paleta de Comandos (Ctrl+K)",
        body: "Digite comandos apenas na entrada da paleta do Sidecar. Sem hacks de barra-comando no compositor nativo, sem quebra de IME.",
        icon: "Command"
      },
      {
        title: "Macros + Scripts de Fluxo",
        body: "Salve, compartilhe, publique e execute scripts de automação de macro que alimentam seu mecanismo de fluxo (flow.ts).",
        icon: "Workflow"
      },
      {
        title: "Histórico tipo terminal",
        body: "Cima/Baixo percorre seus comandos recentes como um shell. Persistido no chrome.storage.local e limitado para manter a sanidade.",
        icon: "History"
      },
      {
        title: "Estimativas de tokens, preguiçosamente",
        body: "Cache por thread, atualização no tempo ocioso e evite re-tokenizar o universo a cada mutação.",
        icon: "Gauge"
      }
    ]
  },
  testimonials: [
    {
      name: "Alex M.",
      role: "Beta tester",
      quote: "O modo amplo mudou totalmente como leio código. Chega de rolagem horizontal."
    },
    {
      name: "Sarah K.",
      role: "Beta tester",
      quote: "Adoro que minhas macros fiquem armazenadas localmente. Finalmente, uma ferramenta que respeita a privacidade."
    },
    {
      name: "Devin R.",
      role: "Acesso antecipado",
      quote: "O contador de tokens no dock muda o jogo para gerenciar a janela de contexto da API."
    }
  ],
  secondaryFeatures: {
    title: "Mais que um dock",
    vscodePets: {
      title: "Pets do VS Code",
      description: "Traga alegria ao seu fluxo de trabalho com seus pets favoritos do VS Code na barra lateral."
    },
    progressQuest: {
      title: "Progress Quest",
      description: "Acompanhe automaticamente estatísticas e progresso de RPG enquanto você conversa e conclui tarefas."
    },
    downloads: {
      title: "Downloads modulares",
      description: "Personalize a instalação do Sidecar. Selecione os componentes necessários para manter a instalação leve.",
      totalSize: "Tamanho total da instalação",
      download: "Baixar selecionados",
      modules: [
        {
          id: "core",
          name: "Sidecar Core",
          description: "Funcionalidades essenciais de runtime e dock.",
          size: 45,
          required: true
        },
        {
          id: "pets",
          name: "Pets do VS Code",
          description: "Companheiros virtuais para a barra lateral.",
          size: 12,
          required: false
        },
        {
          id: "quest",
          name: "Progress Quest",
          description: "Sistema de acompanhamento de progresso de RPG.",
          size: 8,
          required: false
        },
        {
          id: "analytics",
          name: "Analytics local",
          description: "Gráficos avançados e processamento de estatísticas.",
          size: 15,
          required: false
        }
      ]
    }
  },
  roadmapSection: {
    headline: "Pedaços do roteiro (a pilha de 'bom ter')",
    subhead: "Algumas das maiores atualizações que se encaixam na sua especificação. Estes são pontos da página de destino, não promessas.",
    items: [
      {
        title: "Limpeza do título da página",
        body: "Remover 'ChatGPT - ' do título da guia ao executar no contexto da extensão."
      },
      {
        title: "UX de Popover",
        body: "Popovers fecham ao clicar fora e em ações dentro deles."
      },
      {
        title: "Animação da alça de apoio",
        body: "Micro-alça fofa que se expande ao passar o mouse e anima suavemente."
      },
      {
        title: "Recuperação de prompt no compositor",
        body: "Seta para cima visualiza prompts recentes; Seta para a direita insere o prompt completo."
      },
      {
        title: "Proteções de rolagem + modo amplo",
        body: "Parar rolagem automática para o fundo opcionalmente; corrigir estouro do modo amplo em prompts longos."
      },
      {
        title: "Colapso de mensagens",
        body: "Colapsar chats longos com visualização + contagem de caracteres; auto-colapsar ao enviar mais de X caracteres."
      },
      {
        title: "Seus blocos de código",
        body: "Detectar ``` em suas mensagens, renderizar blocos estilizados, destaque de sintaxe, clicar para copiar."
      },
      {
        title: "Escala de fonte",
        body: "Escalar a interface do Sidecar sem alterar o zoom do navegador."
      }
    ]
  },
  ctaSection: {
    headline: "Pronto para atualizar seu fluxo de trabalho?",
    body: "Construa em público, envie rápido e deixe seus usuários o levarem à grandeza."
  },
  stores: {
    chrome: {
      ariaLabel: "Disponível na Chrome Web Store",
      availableIn: "Disponível na",
      chromeWebStore: "Chrome Web Store"
    },
    edge: {
      ariaLabel: "Disponível nos complementos do Microsoft Edge",
      availableOn: "Disponível nos",
      microsoftEdge: "Microsoft Edge"
    },
    firefox: {
      ariaLabel: "Obter o complemento para Firefox",
      getAddon: "Obter o complemento",
      forFirefox: "para Firefox"
    }
  },
  legal: {
    privacyTitle: "Política de Privacidade",
    termsTitle: "Termos de Serviço",
    effectiveDate: "Data de vigência"
  },
  footer: {
    product: "Produto",
    legal: "Legal",
    statusOperational: "Todos os sistemas operacionais"
  },
  faqSection: {
    headline: "Perguntas Frequentes",
    subhead: "Tudo o que você precisa saber sobre o Sidecar e a compatibilidade de extensões do navegador"
  },
  faqs: [
    {
      question: "O que é o Sidecar para ChatGPT?",
      answer: "Sidecar é uma caixa de ferramentas de produtividade e um dock que melhora sua experiência com o ChatGPT com barra lateral persistente, modo amplo, rastreamento de tokens, macros e ferramentas de código — tudo integrado na interface."
    },
    {
      question: "Sidecar é gratuito?",
      answer: "Sim, Sidecar é totalmente gratuito e open source. Acreditamos que ferramentas de produtividade devem ser acessíveis a todos."
    },
    {
      question: "Sidecar funciona com todos os modelos do ChatGPT?",
      answer: "Sim! Sidecar é compatível com todos os modelos, incluindo GPT-4 e GPT-3.5. A extensão melhora a interface independentemente do modelo utilizado."
    },
    {
      question: "Como o Sidecar trata meus dados?",
      answer: "Todos os seus dados (prompts, configurações, macros) ficam armazenados localmente no seu dispositivo. Não coletamos informações pessoais nem rastreamos seu uso."
    },
    {
      question: "Quais funcionalidades o Sidecar oferece?",
      answer: "Sidecar inclui dock inteligente, modo amplo, rastreamento de tokens em tempo real, biblioteca de prompts, blocos de código recolhíveis, seletor de modelo e tipografia personalizável."
    },
    {
      question: "Como instalar o Sidecar?",
      answer: "Instale a extensão pelo Chrome Web Store ou pelos complementos do Firefox. Depois de instalado, o Sidecar se integra automaticamente ao ChatGPT."
    }
  ]
};
