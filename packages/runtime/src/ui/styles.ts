export interface RuntimeStyleConfig {
  documentCssText?: string;
  shadowCssText?: string;
  sourceLabel?: string;
}

const DOCUMENT_STYLE_ID = "cgpt-runtime-document-styles";

let configuredStyles: RuntimeStyleConfig | null = null;
let documentCssInjected = false;

function normalizeCssText(cssText: string | undefined): string {
  return (cssText ?? "").trim();
}

export function configureRuntimeStyles(config: RuntimeStyleConfig): void {
  configuredStyles = {
    documentCssText: normalizeCssText(config.documentCssText),
    shadowCssText: normalizeCssText(config.shadowCssText),
    sourceLabel: config.sourceLabel ?? "runtime",
  };

  const existing = document.getElementById(DOCUMENT_STYLE_ID) as HTMLStyleElement | null;
  if (existing && configuredStyles.documentCssText) {
    existing.textContent = configuredStyles.documentCssText;
    existing.dataset.source = configuredStyles.sourceLabel ?? "runtime";
    documentCssInjected = true;
  }
}

export function getConfiguredShadowCssText(fallbackCssText = ""): string {
  const configured = normalizeCssText(configuredStyles?.shadowCssText);
  return configured || normalizeCssText(fallbackCssText);
}

export function getConfiguredDocumentCssText(): string {
  return normalizeCssText(configuredStyles?.documentCssText);
}

export function injectConfiguredDocumentCssOnce(): void {
  if (documentCssInjected) return;

  const cssText = getConfiguredDocumentCssText();
  if (!cssText) return;

  const existing = document.getElementById(DOCUMENT_STYLE_ID) as HTMLStyleElement | null;
  if (existing) {
    if (existing.textContent !== cssText) existing.textContent = cssText;
    existing.dataset.source = configuredStyles?.sourceLabel ?? "runtime";
    documentCssInjected = true;
    return;
  }

  const style = document.createElement("style");
  style.id = DOCUMENT_STYLE_ID;
  style.dataset.source = configuredStyles?.sourceLabel ?? "runtime";
  style.textContent = cssText;

  const target = document.head || document.documentElement;
  target.appendChild(style);
  documentCssInjected = true;
}
