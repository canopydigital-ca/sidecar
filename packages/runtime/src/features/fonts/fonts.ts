import { FLAGS } from "../../core/constants";
import { updateSettings } from "../settings/storage";
import { UIState } from "../../core/types";

function ensureGoogleFontLink(href: string | null) {
  const id = "cgpt-font-link";
  let link = document.getElementById(id) as HTMLLinkElement;
  if (!href) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = href;
}

export function applyFontChoice(uiState: UIState) {
  const name = uiState.fontName || "System UI";
  const css = uiState.fontCss || null;

  if (name === "System UI") {
    document.documentElement.classList.remove(FLAGS.fontOn);
    document.documentElement.style.removeProperty("--cgpt-font-family");
    ensureGoogleFontLink(null);
    return;
  }

  ensureGoogleFontLink(css);
  document.documentElement.classList.add(FLAGS.fontOn);
  document.documentElement.style.setProperty("--cgpt-font-family", `"${name}", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`);
}

export async function persistFontChoice(uiState: UIState) {
  await updateSettings({
    ui: {
      fontName: uiState.fontName,
      fontCss: uiState.fontCss
    }
  });
}
