import { state } from "../../core/state";

// Patterns to strip from page titles
const TITLE_PATTERNS = [
  /^ChatGPT\s*-\s*/, // "ChatGPT - " with optional spaces around dash
  /^ChatGPT\s*:\s*/, // "ChatGPT : " with optional spaces around colon
  /^ChatGPT\s+/,     // "ChatGPT " with spaces
  /^OpenAI\s*-\s*/,  // "OpenAI - " with optional spaces around dash
  /^OpenAI\s*:\s*/,  // "OpenAI : " with optional spaces around colon
  /^OpenAI\s+/,      // "OpenAI " with spaces
];

let originalTitle: string | null = null;
let titleObserver: MutationObserver | null = null;
let isStrippingEnabled = false;

export function stripTitlePatterns(title: string): string {
  let stripped = title;
  
  for (const pattern of TITLE_PATTERNS) {
    stripped = stripped.replace(pattern, '');
  }
  
  return stripped.trim();
}

export function shouldStripTitle(title: string): boolean {
  return TITLE_PATTERNS.some(pattern => pattern.test(title));
}

export function startTitleStripping() {
  if (isStrippingEnabled) return;
  
  isStrippingEnabled = true;
  originalTitle = document.title;
  
  // Strip initial title if needed
  if (shouldStripTitle(document.title)) {
    const stripped = stripTitlePatterns(document.title);
    if (stripped && stripped !== document.title) {
      document.title = stripped;
    }
  }
  
  // Set up observer for future title changes
  titleObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
        const currentTitle = document.title;
        
        if (shouldStripTitle(currentTitle)) {
          const stripped = stripTitlePatterns(currentTitle);
          if (stripped && stripped !== currentTitle) {
            // Use requestAnimationFrame to avoid recursion
            requestAnimationFrame(() => {
              document.title = stripped;
            });
          }
        }
      }
    }
  });
  
  // Observe title changes on the document element
  titleObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['title'],
    subtree: false
  });
}

export function stopTitleStripping() {
  if (titleObserver) {
    titleObserver.disconnect();
    titleObserver = null;
  }
  
  if (originalTitle !== null) {
    document.title = originalTitle;
    originalTitle = null;
  }
  
  isStrippingEnabled = false;
}

export function isTitleStrippingEnabled(): boolean {
  return isStrippingEnabled;
}