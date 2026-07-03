import { DockContext } from "../../core/context";
import { getHostAdapter } from "../../core/host";
import { getAriaExpanded } from "../../core/dom";
import { retry } from "../../ui/flow";

export async function handleProjectAction(ctx: DockContext) {
  const host = getHostAdapter();

  try {
    const openBtn = host.findSidebarActionButton("open");
    if (openBtn) {
      const isExpanded = getAriaExpanded(openBtn);
      if (!isExpanded) {
        (openBtn as HTMLElement).click();
        await retry(() => {
          const scrollport = host.findSidebarScrollport();
          if (!scrollport) throw new Error("Sidebar not ready");
          return scrollport;
        }, { timeoutMs: 2000, intervalMs: 50, name: "waitForSidebarScrollport" });
      }
    } else if (!host.findSidebarScrollport()) {
      ctx.showToast("Sidebar not available.");
      return;
    }

    const targetItem = host.findCurrentHistoryItem(window.location.pathname);
    if (!targetItem) {
      ctx.showToast("Current chat not found in history.");
      return;
    }

    const optionsBtn = host.findHistoryItemOptionsButton(targetItem);
    if (!optionsBtn) {
      ctx.showToast("Options button not found for this chat.");
      return;
    }

    optionsBtn.click();

    const menu = await retry(() => {
      const surface = host.findVisibleMenuSurface();
      if (!surface) throw new Error("Options menu not visible");
      return surface;
    }, { timeoutMs: 2000, intervalMs: 50, name: "waitForProjectActionMenu" });

    const moveItem = host.findMenuItemByText("move to project", menu);
    if (!moveItem) {
      ctx.showToast("Move to project option not found.");
      optionsBtn.click();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
    moveItem.click();
  } catch (err) {
    console.error("Project action failed:", err);
    ctx.showToast("Failed to invoke Move to Project.");
  }
}
