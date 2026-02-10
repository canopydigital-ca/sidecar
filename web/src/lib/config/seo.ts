export interface SeoConfig {
	siteName: string;
	defaultTitle: string;
	defaultDescription: string;
	defaultKeywords: string[];
	baseUrl: string;
	twitterHandle: string;
	defaultImage: string;
}

export interface ProductConfig {
	name: string;
	applicationCategory: string;
	operatingSystem: string;
	offers: {
		price: string;
		priceCurrency: string;
	};
	rating: {
		ratingValue: number;
		ratingCount: number;
	};
	social: {
		github: string;
		twitter?: string;
	};
}

export const BASE_URL = 'https://sidecar.canopydigital.ca';

export const PRODUCT_CONFIG: ProductConfig = {
	name: 'Sidecar for ChatGPT',
	applicationCategory: 'BrowserExtension',
	operatingSystem: 'Chrome, Edge, Firefox',
	offers: {
		price: '0',
		priceCurrency: 'USD'
	},
	rating: {
		ratingValue: 4.9,
		ratingCount: 120
	},
	social: {
		github: 'https://github.com/your-org/sidecar',
		twitter: '@canopydigital'
	}
};

export const SEO_CONFIG: SeoConfig = {
	siteName: 'Sidecar',
	defaultTitle: 'Sidecar for ChatGPT: The Ultimate Productivity Dock',
	defaultDescription: 'Upgrade ChatGPT with a native sidebar dock, wide mode, macro commands, and real-time token tracking. The essential browser extension for power users.',
	baseUrl: BASE_URL,
	defaultImage: '/images/social-preview.png', // Placeholder, we will need to create this or map it
	twitterHandle: '@canopydigital',
	defaultKeywords: [
		'ChatGPT extension',
		'ChatGPT sidebar',
		'ChatGPT wide mode',
		'AI productivity tools',
		'ChatGPT dock',
		'prompt library',
		'token counter',
		'ChatGPT macros',
		'browser extension'
	]
};

// Feature-specific SEO templates
export const FEATURE_TEMPLATES = {
	title: (feature: string) => `${feature} for ChatGPT | Sidecar Extension`,
	description: (feature: string) => `Enable ${feature} in ChatGPT with Sidecar. The productivity toolbox that adds a native dock, macros, and wide mode to your chat interface.`,
};

export const seoData = {
	baseUrl: SEO_CONFIG.baseUrl,
	siteName: SEO_CONFIG.siteName,
	defaultTitle: SEO_CONFIG.defaultTitle,
	defaultDescription: SEO_CONFIG.defaultDescription,
	defaultImage: SEO_CONFIG.defaultImage,
	defaultKeywords: SEO_CONFIG.defaultKeywords,
	twitterHandle: SEO_CONFIG.twitterHandle,
	product: PRODUCT_CONFIG,

	routes: {
		home: {
			title: SEO_CONFIG.defaultTitle,
			description: SEO_CONFIG.defaultDescription,
			canonical: BASE_URL,
			keywords: [...SEO_CONFIG.defaultKeywords, 'ChatGPT plugins', 'AI workflow']
		},
		privacy: {
			title: 'Privacy Policy | Sidecar',
			description: 'We respect your privacy. Sidecar runs entirely in your browser and does not collect your chat data.',
			canonical: `${BASE_URL}/privacy`,
			keywords: ['privacy policy', 'data security', 'local storage']
		},
		terms: {
			title: 'Terms of Service | Sidecar',
			description: 'Terms of service for using the Sidecar browser extension.',
			canonical: `${BASE_URL}/terms`,
			keywords: ['terms of service', 'user agreement']
		},
		license: {
			title: 'License | Sidecar',
			description: 'Sidecar is open source software. View our license details.',
			canonical: `${BASE_URL}/license`,
			keywords: ['open source license', 'MIT license']
		}
	}
};
