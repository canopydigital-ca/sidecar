import type { ProductConfig, SeoConfig } from '$lib/config/seo';

export interface Translation {
  site: {
    brand: string;
    storeTitle: string;
    tagline: string;
    versionBadge: string;
    heroHeadline: string;
    heroAccent: string;
    heroBody: string;
    ctaPrimary: string;
    ctaSecondary: string;
    legalDisclaimer: string;
    availableOnAllMajorBrowsers?: string;
    demoBanner?: string;
    trust?: {
      openSource: string;
      noAccount: string;
      readsPageOnly: string;
    };
    demo?: {
      title: string;
      subtitle: string;
    };
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
  };
  nav: {
    features: string;
    macros: string;
    roadmap: string;
    testimonials: string;
    github: string;
  };
  stats: {
    activeUsers: string;
    promptsSaved: string;
    tokensTracked: string;
    rating: string;
    timeSaved: string;
    promptLibrary: string;
    privacyFocus: string;
    betaStatus: string;
    // Suffixes/Notes
    suffixPerWeek: string;
    noteProjected: string;
    noteTemplates: string;
    noteLocalStorage: string;
    notePublicPreview: string;
  };
  featuresHeader?: {
    headline: string;
    subhead: string;
  };
  features: Array<{
    title: string;
    description: string;
  }>;
  howItWorks?: {
    headline: string;
    subhead: string;
    steps: Array<{
      title: string;
      body: string;
      icon?: string;
    }>;
  };
  macrosSection?: {
    headline: string;
    subhead: string;
    items: Array<{
      title: string;
      body: string;
      icon?: string;
    }>;
  };
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
  }>;
  secondaryFeatures: {
    title: string;
    vscodePets: {
      title: string;
      description: string;
    };
    progressQuest: {
      title: string;
      description: string;
    };
    downloads: {
      title: string;
      description: string;
      version?: string;
      baseUrl?: string;
      totalSize: string;
      download: string;
      modules: Array<{
        id: string;
        name: string;
        description: string;
        size: number; // in MB
        required?: boolean;
      }>;
    };
  };
  roadmapSection?: {
    headline: string;
    subhead: string;
    items: Array<{
      title: string;
      body: string;
    }>;
  };
  ctaSection?: {
    headline: string;
    body: string;
  };
  stores?: {
    chrome: {
      ariaLabel: string;
      availableIn: string;
      chromeWebStore: string;
    };
    edge: {
      ariaLabel: string;
      availableOn: string;
      microsoftEdge: string;
    };
    firefox: {
      ariaLabel: string;
      getAddon: string;
      forFirefox: string;
    };
  };
  legal: {
    privacyTitle: string;
    termsTitle: string;
    effectiveDate: string;
  };
  footer?: {
    product: string;
    legal: string;
    statusOperational: string;
  };
  faqSection?: {
    headline: string;
    subhead: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}
