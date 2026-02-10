import { DockContext } from "../../core/context";
import { queryFirst, queryAll, getAriaExpanded } from "../../core/dom";
import { waitForKey } from "../../ui/flow";

export async function handleProjectAction(ctx: DockContext) {
  try {
    // 1. Ensure Sidebar is Open
    const openBtn = queryFirst("sidebar.open");
    if (openBtn) {
      const isExpanded = getAriaExpanded(openBtn);
      if (!isExpanded) {
        (openBtn as HTMLElement).click();
        // Wait for sidebar content to load
        await waitForKey("sidebar.scrollport", { timeoutMs: 2000 });
      }
    } else {
      // If no open button, check if sidebar is already visible (maybe wide mode or always open)
      // If we can't find open button and can't find scrollport, we might be stuck.
      const scrollport = queryFirst("sidebar.scrollport");
      if (!scrollport) {
        ctx.showToast("Sidebar not available.");
        return;
      }
    }

    // 2. Find Current Chat in History
    const currentPath = window.location.pathname;
    const historyItems = queryAll("sidebar.history.item");
    let targetItem: HTMLElement | null = null;

    // Strict match first, then loose match
    for (const item of historyItems) {
      const href = item.getAttribute("href");
      if (href === currentPath) {
        targetItem = item as HTMLElement;
        break;
      }
    }

    if (!targetItem) {
      // Fallback: check if any item is marked active/current by class
      // Often the active item has a specific background class or aria-current
      targetItem = historyItems.find(el =>
        el.getAttribute("aria-current") === "page" ||
        el.classList.contains("bg-token-sidebar-surface-secondary") // heuristic
      ) as HTMLElement || null;
    }

    if (!targetItem) {
      ctx.showToast("Current chat not found in history.");
      return;
    }

    // 3. Find Options Button for this item
    // The options button is usually a sibling or inside a shared container (group)
    // Structure is usually: <li><a>...</a> <button>...</button></li> or similar group
    // We look for the options button within the same "group" container
    let group: HTMLElement | null = targetItem.closest("li") || targetItem.closest("div.group");
    if (!group) {
      // Fallback: assume button is next sibling
      group = targetItem.parentElement;
    }

    if (!group) {
      ctx.showToast("Could not locate chat item container.");
      return;
    }

    // Use registry selector but scoped to this group
    // registry key is "sidebar.history.itemOptions"
    // We can't use queryFirst(key) because it searches document.
    // We need to match the selector manually.
    // Let's import the selector string if possible, or duplicate logic safely.
    // Better: use the selector from registry.
    // We can't easily import REGISTRY values dynamically without helper, but we know the selector.
    // Actually, let's use a helper if we had one.
    // For now, I'll use the known selector from registry.ts
    const optionsSelector = '#history button[data-testid^="history-item-"][data-testid$="-options"]';
    // Remove #history since we are inside the group
    const scopedSelector = 'button[data-testid^="history-item-"][data-testid$="-options"]';

    const optionsBtn = group.querySelector(scopedSelector) as HTMLElement;

    if (!optionsBtn) {
      // Fallback: look for any button with "options" in label
      const fallback = group.querySelector('button[aria-label*="options"], button[aria-label*="actions"]') as HTMLElement;
      if (!fallback) {
        ctx.showToast("Options button not found for this chat.");
        return;
      }
      fallback.click();
    } else {
      optionsBtn.click();
    }

    // 4. Wait for Menu and Click "Move to project"
    // Menu is usually in a portal, so we wait for a VISIBLE menu
    // We can't use simple waitFor because it might pick up hidden menus (e.g. model picker)
    let menu: HTMLElement | null = null;
    const start = Date.now();
    while (Date.now() - start < 2000) {
      const candidates = queryAll("menu.modelSelector");
      menu = candidates.find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement || null;
      if (menu) break;
      await new Promise(r => requestAnimationFrame(r));
    }

    if (!menu) {
      ctx.showToast("Options menu did not appear.");
      return;
    }

    // Find "Move to project" item
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    const moveItem = items.find(el => (el.textContent || "").toLowerCase().includes("move to project"));

    if (moveItem) {
      // Yield a bit to ensure UI is ready
      await new Promise(r => setTimeout(r, 50));
      (moveItem as HTMLElement).click();
      // Success! Native picker should appear.
    } else {
      ctx.showToast("Move to project option not found.");
      // Close menu to be nice
      optionsBtn.click();
    }

  } catch (err) {
    console.error("Project action failed:", err);
    ctx.showToast("Failed to invoke Move to Project.");
  }
}
