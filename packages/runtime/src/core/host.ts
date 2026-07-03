export type ComposerAnchor = {
  anchor: Element;
  parent: Element;
};

export type SidebarAction = "open" | "close";

export interface ChatGptHostAdapter {
  readonly id: string;
  getScrollContainer(): Element | null;
  isProjectConversationView(): boolean;
  findComposerEditor(): Element | null;
  findComposerResizeTarget(): Element | null;
  findComposerAnchor(): ComposerAnchor | null;
  findModelPicker(): Element | null;
  findSidebarContainer(): Element | null;
  findSidebarScrollport(): Element | null;
  findSidebarActionButton(action: SidebarAction): Element | null;
  findCurrentHistoryItem(pathname: string): HTMLElement | null;
  findHistoryItemOptionsButton(item: Element): HTMLElement | null;
  listFloatingMenuSurfaces(): HTMLElement[];
  findVisibleMenuSurface(): HTMLElement | null;
  findMenuItemByText(text: string, root?: ParentNode | null): HTMLElement | null;
  isSidebarOpen(): boolean;
  getSidebarRightEdge(): number;
}

const defaultHostAdapter: ChatGptHostAdapter = {
  id: "default",
  getScrollContainer: () => null,
  isProjectConversationView: () => false,
  findComposerEditor: () => null,
  findComposerResizeTarget: () => null,
  findComposerAnchor: () => null,
  findModelPicker: () => null,
  findSidebarContainer: () => null,
  findSidebarScrollport: () => null,
  findSidebarActionButton: () => null,
  findCurrentHistoryItem: () => null,
  findHistoryItemOptionsButton: () => null,
  listFloatingMenuSurfaces: () => [],
  findVisibleMenuSurface: () => null,
  findMenuItemByText: () => null,
  isSidebarOpen: () => false,
  getSidebarRightEdge: () => 0,
};

let activeHostAdapter: ChatGptHostAdapter = defaultHostAdapter;

export function setHostAdapter(adapter: ChatGptHostAdapter): void {
  activeHostAdapter = adapter;
}

export function resetHostAdapter(): void {
  activeHostAdapter = defaultHostAdapter;
}

export function getHostAdapter(): ChatGptHostAdapter {
  return activeHostAdapter;
}
