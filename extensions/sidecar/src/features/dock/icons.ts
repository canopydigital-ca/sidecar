import type { DockContext } from "../../core/context";
import { MODEL_SLOT_ID } from "../../core/constants";
import type { GlobalSettings } from "../settings/schema";

export type DockItemDef = {
  id: string;
  label: string;
  iconSvg: string;
  defaultColor?: string;
  canRemove: boolean;
  render?: (el: HTMLElement, ctx: DockContext, settings: GlobalSettings) => void;
  onClick?: (ctx: DockContext, trigger: HTMLElement, settings: GlobalSettings) => void;
};

const ICONS = {
  sidebar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
  wide: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`,
  chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`,
  collapse: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline></svg>`,
  emoji: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
  prompts: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  gameIcons: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3"></path><path d="M18.364 5.636l-2.121 2.121"></path><path d="M21 12h-3"></path><path d="M18.364 18.364l-2.121-2.121"></path><path d="M12 21v-3"></path><path d="M5.636 18.364l2.121-2.121"></path><path d="M3 12h3"></path><path d="M5.636 5.636l2.121 2.121"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  fonts: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  help: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  project: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  progressquest: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l7 7-9 9H5v-7z"></path><path d="M14 3l-2 2"></path><path d="M8 17l-2 2"></path><path d="M7 7h7"></path><path d="M7 11h3"></path></svg>`,
  pets: `<svg width="16" height="16" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"><path d="M457.74 170.1a30.26 30.26 0 0 0-11.16-2.1h-.4c-20.17.3-42.79 19.19-54.66 47.76-14.23 34.18-7.68 69.15 14.74 78.14a30.21 30.21 0 0 0 11.15 2.1c20.27 0 43.2-19 55.17-47.76C486.71 214.06 480.06 179.09 457.74 170.1Z"></path><path d="M327.6 303.48C299.8 257.35 287.8 240 256 240s-43.9 17.46-71.7 63.48c-23.8 39.36-71.9 42.64-83.9 76.07a50.91 50.91 0 0 0-3.6 19.25c0 27.19 20.8 49.2 46.4 49.2 31.8 0 75.1-25.39 112.9-25.39S337 448 368.8 448c25.6 0 46.3-22 46.3-49.2a51,51 0,0,0-3.7-19.25C399.4 346 351.4 342.84 327.6 303.48Z"></path><path d="M192.51 196a26.53 26.53 0 0 0 4-.3c23.21-3.37 37.7-35.53 32.44-71.85C224 89.61 203.22 64 181.49 64a26.53 26.53 0,0,0-4 .3c-23.21 3.37-37.7 35.53-32.44 71.85C150 170.29 170.78 196 192.51 196Z"></path><path d="M366.92 136.15c5.26-36.32-9.23-68.48-32.44-71.85a26.53 26.53,0,0,0-4-.3c-21.73 0-42.47 25.61-47.43 59.85-5.26 36.32 9.23 68.48 32.44 71.85a26.53 26.53,0,0,0 4 .3C341.22 196 362 170.29 366.92 136.15Z"></path><path d="M105.77 293.9c22.39-9 28.93-44 14.72-78.14C108.53 187 85.62 168 65.38 168a30.21 30.21,0,0,0-11.15 2.1c-22.39 9-28.93 44-14.72 78.14C51.47 277 74.38 296 94.62 296A30.21 30.21 0,0,0 105.77 293.9Z"></path></svg>`
};

export const DOCK_ITEM_DEFS: Record<string, DockItemDef> = {
  sidebar: { id: "sidebar", label: "Toggle sidebar", iconSvg: ICONS.sidebar, canRemove: true },
  wide: { id: "wide", label: "Full width conversation", iconSvg: ICONS.wide, canRemove: true },
  inputToggle: { id: "inputToggle", label: "Collapse/restore input height", iconSvg: ICONS.chevronDown, canRemove: true },
  collapseCode: { id: "collapseCode", label: "Collapse/expand code blocks", iconSvg: ICONS.collapse, canRemove: true },
  emoji: { id: "emoji", label: "Emoji picker", iconSvg: ICONS.emoji, canRemove: true },
  pets: { id: "pets", label: "Pets", iconSvg: ICONS.pets, canRemove: true },
  progressquest: { id: "progressquest", label: "ProgressQuest", iconSvg: ICONS.progressquest, canRemove: true },
  pqChip: {
    id: "pqChip",
    label: "ProgressQuest status",
    iconSvg: "",
    canRemove: false,
    render: (el) => {
      if (el.id !== "cgpt-pq-chip-root") el.id = "cgpt-pq-chip-root";
      if (el.className !== "ml-1 mr-1") el.className = "ml-1 mr-1";
    },
  },
  prompts: { id: "prompts", label: "Prompts", iconSvg: ICONS.prompts, canRemove: true },
  gameIcons: { id: "gameIcons", label: "Game icons demo", iconSvg: ICONS.gameIcons, canRemove: true },
  project: { id: "project", label: "Move to project", iconSvg: ICONS.project, canRemove: true },
  modelSlot: {
    id: "modelSlot",
    label: "Model picker (moved)",
    iconSvg: "",
    canRemove: false,
    render: (el) => {
      if (el.id !== MODEL_SLOT_ID) el.id = MODEL_SLOT_ID;
      el.setAttribute("title", "Model picker (moved)");
    },
  },
  spacer: {
    id: "spacer",
    label: "Spacer",
    iconSvg: "",
    canRemove: false,
    render: (el) => {
      if (el.className !== "cgpt-spacer") el.className = "cgpt-spacer";
    },
  },
  fonts: { id: "fonts", label: "Fonts", iconSvg: ICONS.fonts, canRemove: true },
  settings: { id: "settings", label: "Settings", iconSvg: ICONS.settings, canRemove: true },
  help: { id: "help", label: "Help", iconSvg: ICONS.help, canRemove: true },
};
