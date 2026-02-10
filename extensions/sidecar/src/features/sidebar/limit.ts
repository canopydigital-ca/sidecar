import { findSidebarContainer } from "./find";

export function limitConversations() {
  const sidebar = findSidebarContainer();
  if (!sidebar) return;

  const nav = sidebar.querySelector("nav");
  if (!nav) return;

  const lists = nav.querySelectorAll("ol, ul");
  let targetList: Element | null = null;
  for (const list of lists) {
    if (list.children.length > 8) {
      targetList = list;
      break;
    }
  }

  if (!targetList) return;
  if (nav.querySelector(".cgpt-show-all-btn")) return;

  const items = Array.from(targetList.children);
  let hiddenCount = 0;
  for (let i = 8; i < items.length; i++) {
    (items[i] as HTMLElement).style.display = "none";
    items[i].classList.add("cgpt-hidden-conv");
    hiddenCount++;
  }

  if (hiddenCount > 0) {
    const btn = document.createElement("button");
    btn.className = "cgpt-show-all-btn cgpt-btn";
    btn.textContent = `Show all (${items.length})`;
    btn.style.marginTop = "8px";
    btn.style.width = "100%";
    btn.onclick = () => {
      items.forEach(el => (el as HTMLElement).style.display = "");
      btn.remove();
    };
    targetList.insertAdjacentElement("afterend", btn);
  }
}
