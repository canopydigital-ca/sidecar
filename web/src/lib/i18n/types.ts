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
  features: Array<{
    title: string;
    description: string;
  }>;
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
  legal: {
    privacyTitle: string;
    termsTitle: string;
    effectiveDate: string;
  };
}
