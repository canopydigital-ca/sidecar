export type RawEl = {
  tag: string;
  role: string | null;
  type: string | null;
  testid: string | null;
  ariaLabel: string | null;
  name: string;
  selectorHint: string;
  scopeHint: string | null;
};

export type Control = {
  key: string;                 // logical intent id
  selectors: string[];         // priority ordered
  scope?: string;
  notes?: string;
};

const isJunk = (e: RawEl) => {
  const noSignal =
    !e.testid && !e.ariaLabel && (!e.name || e.name.trim() === "") &&
    (e.selectorHint === "button" || e.selectorHint === "a" || e.selectorHint === "input");
  return noSignal;
};

const cssEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export const nearestStableAncestor = (el: Element): string | null => {
  const a = el.closest("[data-testid], [aria-label], nav, main, aside, header, footer");
  if (!a) return null;
  const testid = a.getAttribute("data-testid");
  const aria = a.getAttribute("aria-label");
  const tag = a.tagName.toLowerCase();

  // Pre-escape to avoid minification issues (shadowing)
  const escapedTestId = testid ? cssEscape(testid) : "";
  const escapedAria = aria ? cssEscape(aria) : "";

  return testid
    ? `${tag}[data-testid="${escapedTestId}"]`
    : aria
      ? `${tag}[aria-label="${escapedAria}"]`
      : tag;
};

const stableSelector = (e: RawEl): string | null => {
  if (e.testid) {
    const escaped = cssEscape(e.testid);
    return `${e.tag}[data-testid="${escaped}"]`;
  }
  if (e.ariaLabel) {
    const escaped = cssEscape(e.ariaLabel);
    return `${e.tag}[aria-label="${escaped}"]`;
  }
  if (e.role && e.name) {
    const escaped = cssEscape(e.role);
    return `[role="${escaped}"]`; // fallback, not great
  }
  return null;
};

const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

export function buildControlRegistry(raw: RawEl[]): Control[] {
  const items = raw.filter((e) => !isJunk(e));

  // Index by best stable identifier to dedupe (testid > ariaLabel > tag+name)
  const byId = new Map<string, RawEl[]>();
  for (const e of items) {
    const id =
      (e.testid && `t:${e.testid}`) ||
      (e.ariaLabel && `a:${e.ariaLabel}`) ||
      `n:${e.tag}:${e.role ?? ""}:${e.name}`;
    const arr = byId.get(id) ?? [];
    arr.push(e);
    byId.set(id, arr);
  }

  const controls: Control[] = [];

  const pick = (key: string, predicate: (e: RawEl) => boolean, notes?: string) => {
    const matches = items.filter(predicate);
    const sels = uniq(matches.map(stableSelector).filter(Boolean) as string[]);

    // Determine common scope if any
    const scopes = uniq(matches.map(m => m.scopeHint).filter(Boolean) as string[]);
    const commonScope = scopes.length === 1 ? scopes[0] : undefined;

    if (sels.length) controls.push({ key, selectors: sels, scope: commonScope, notes });
  };

  // Sidebar + top chrome
  pick("sidebar.open", (e) => e.ariaLabel === "Open sidebar");
  pick("sidebar.close", (e) => e.testid === "close-sidebar-button" || e.ariaLabel === "Close sidebar");
  pick("chat.new", (e) => e.testid === "create-new-chat-button");
  pick("nav.images", (e) => e.testid === "sidebar-item-library"); // label sometimes "Images"
  pick("nav.apps", (e) => e.testid === "apps-button");
  pick("profile.menu", (e) => e.testid === "accounts-profile-button");
  pick("model.dropdown", (e) => e.testid === "model-switcher-dropdown-button");
  pick("chat.share", (e) => e.testid === "share-chat-button" || e.ariaLabel === "Share");
  pick("chat.options", (e) => e.testid === "conversation-options-button" || e.ariaLabel === "Open conversation options");

  // History item options (sidebar list)
  pick(
    "history.item.options",
    (e) => typeof e.testid === "string" && /^history-item-\d+-options$/.test(e.testid),
    "Use the specific N for a given row, or locate by row then find its options button."
  );

  // Turn actions
  pick("turn.copy", (e) => e.testid === "copy-turn-action-button" || e.ariaLabel === "Copy");
  pick("turn.good", (e) => e.testid === "good-response-turn-action-button");
  pick("turn.bad", (e) => e.testid === "bad-response-turn-action-button");
  pick("turn.sources", (e) => e.ariaLabel === "Sources");

  // Composer
  pick("composer.plus", (e) => e.testid === "composer-plus-btn");
  pick("composer.voice.start", (e) => e.ariaLabel === "Start Voice");
  pick("composer.voice.dictate", (e) => e.ariaLabel === "Dictate button");

  // File input: keep generic but constrain at runtime by visibility/enabled
  pick("composer.file", (e) => e.tag === "input" && e.type === "file", "Pick the visible/enabled input at action-time.");

  return controls;
}
