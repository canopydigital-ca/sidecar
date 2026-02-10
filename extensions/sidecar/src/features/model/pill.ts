import { DockContext } from "../../core/context";
import { queryFirst, $$ } from "../../core/dom";
import { waitForKey } from "../../ui/flow";

const PILL_TRIGGER_ID = "cgpt-pill-model-trigger";

export async function injectPillModelTrigger(ctx: DockContext) {
  // 1. Find the pill
  const pill = queryFirst("composer.extendedThinking.pill");
  if (!pill) return;

  // 2. Check if we already injected
  const composite = pill.closest(".__composer-pill-composite");
  if (!composite) return; // Should be in a composite if it's that kind of pill

  if (composite.querySelector(`#${PILL_TRIGGER_ID}`)) return;

  // 3. Create the trigger button
  const btn = document.createElement("button");
  btn.id = PILL_TRIGGER_ID;
  btn.type = "button";
  btn.className = "cgpt-btn cgpt-pill-trigger";
  btn.setAttribute("aria-label", "Model selector");
  btn.setAttribute("aria-haspopup", "menu");

  // Minimal icon (chevron down or model icon)
  // Using a simple SVG
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.7"><path d="M6 9l6 6 6-6"/></svg>`;

  // Style it to fit in the composite
  // Assuming composite is flex. We want it "immediately left of the composer’s ... pill label".
  btn.style.marginRight = "4px";
  btn.style.padding = "2px";
  btn.style.borderRadius = "4px";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.cursor = "pointer";
  btn.style.border = "none";
  btn.style.background = "transparent";
  btn.style.color = "inherit";

  // Hover effect
  btn.onmouseenter = () => btn.style.background = "rgba(255,255,255,0.1)";
  btn.onmouseleave = () => btn.style.background = "transparent";

  // 4. Insert left of pill
  composite.insertBefore(btn, pill);

  // 5. Wire click event
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Click real selector
    const realSelector = queryFirst("header.modelSelector") as HTMLElement;
    if (!realSelector) {
      console.warn("[Dock] Real model selector not found");
      return;
    }

    realSelector.click();

    // Wait for menu
    try {
      // We wait for a menu that is NOT inside our dock/overlay
      const menu = await waitForKey("menu.modelSelector", { timeoutMs: 2000 });

      // Reposition
      repositionMenu(menu, btn);

      // Keep repositioning briefly
      requestAnimationFrame(() => repositionMenu(menu, btn));

    } catch (err) {
      console.warn("[Dock] Model menu did not appear", err);
    }
  });
}

function repositionMenu(menu: Element, trigger: HTMLElement) {
  const m = menu as HTMLElement;
  const tRect = trigger.getBoundingClientRect();

  // We want to position it near the trigger.
  m.style.position = "fixed";
  m.style.top = `${tRect.bottom + 8}px`;
  m.style.left = `${tRect.left}px`;
  m.style.transform = "none"; // Clear any Radix transforms
  m.style.margin = "0";
  m.style.zIndex = "2147483647"; // Max z-index

  // Ensure it's not off-screen
  const mRect = m.getBoundingClientRect();
  if (mRect.right > window.innerWidth) {
    m.style.left = "auto";
    m.style.right = "10px";
  }
  if (mRect.bottom > window.innerHeight) {
    m.style.top = "auto";
    m.style.bottom = `${window.innerHeight - tRect.top + 8}px`;
  }
}
