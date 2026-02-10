import { type DockContext } from "../core/context";

export type PopoverKind = string;
export type CloseReason = "reclick" | "switch" | "escape" | "outside" | "manual" | "detach";

export class PopoverState {
  activeKind = $state<PopoverKind | null>(null);
  triggerEl = $state<HTMLElement | null>(null);
  context = $state<DockContext | null>(null);
  
  // For specialized sizing or data
  metadata = $state<Record<string, any>>({});

  constructor() {}

  setOpen(kind: PopoverKind, trigger: HTMLElement, ctx: DockContext, meta: Record<string, any> = {}) {
    this.activeKind = kind;
    this.triggerEl = trigger;
    this.context = ctx;
    this.metadata = meta;
  }

  setClosed() {
    this.activeKind = null;
    this.triggerEl = null;
    this.context = null;
    this.metadata = {};
  }
  
  isOpen(kind?: PopoverKind): boolean {
      if (!kind) return !!this.activeKind;
      return this.activeKind === kind;
  }
}

export const popoverState = new PopoverState();
