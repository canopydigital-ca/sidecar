import { storageService } from "../../core/storage/index";
import type { PromptItem, RecentPromptItem } from "../../core/storage/registry";
import { isDeadContext } from "../../core/storage";
import { log } from "../../core/log";
import { formatError } from "../../core/errors";

function uuid() { return crypto.randomUUID(); }

export async function loadPrompts(): Promise<PromptItem[]> {
  try {
    if (isDeadContext()) return [];
    // Ensure loaded
    if (!storageService.prompts.loaded) await storageService.prompts.init();
    return storageService.prompts.value;
  } catch (e) {
    if (String(e).includes("Extension context invalidated")) return [];
    log.error("Error loading prompts:", formatError(e));
    return [];
  }
}

export async function setPrompts(prompts: PromptItem[]): Promise<void> {
  try {
    // Optimistic set (assumes loaded or don't care about prev value)
    storageService.prompts.set(prompts);
  } catch (e) {
    if (!String(e).includes("Extension context invalidated")) {
      log.error("Error saving prompts:", formatError(e));
    }
  }
}

export async function savePrompt(prompt: Partial<PromptItem> & Pick<PromptItem, "text">): Promise<void> {
  if (!storageService.prompts.loaded) await storageService.prompts.init();
  const normalizedPrompt: PromptItem = {
    id: prompt.id ?? uuid(),
    text: prompt.text,
    title: prompt.title,
    tags: prompt.tags,
  };

  storageService.prompts.update((current: PromptItem[]) => {
    const next = [normalizedPrompt, ...current];
    return next.slice(0, 60);
  });
}

export async function loadRecentPrompts(): Promise<RecentPromptItem[]> {
  try {
    if (isDeadContext()) return [];
    if (!storageService.recentPrompts.loaded) await storageService.recentPrompts.init();
    return storageService.recentPrompts.value;
  } catch (e) {
    if (String(e).includes("Extension context invalidated")) return [];
    log.error("Error loading recent prompts:", formatError(e));
    return [];
  }
}

export async function setRecentPrompts(items: RecentPromptItem[]): Promise<void> {
  try {
    storageService.recentPrompts.set(items);
  } catch (e) {
    if (!String(e).includes("Extension context invalidated")) {
      log.error("Error saving recent prompts:", formatError(e));
    }
  }
}

export async function recordRecentPrompt(text: string) {
  const t = (text || "").trim();
  if (!t) return;

  if (!storageService.recentPrompts.loaded) await storageService.recentPrompts.init();
  const current = storageService.recentPrompts.value;

  if (current.length && (current[0]?.text || "").trim() === t) return;

  storageService.recentPrompts.update((items: RecentPromptItem[]) => {
    const next = [{ id: uuid(), text: t, ts: Date.now(), url: window.location.href }, ...items];
    return next.slice(0, 80);
  });
}
