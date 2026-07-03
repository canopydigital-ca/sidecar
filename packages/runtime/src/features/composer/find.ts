import { queryFirst } from "../../core/dom";
import { getHostAdapter } from "../../core/host";

export type PerfTracker = (name: string, duration: number, success: boolean, info?: string) => void;

function track<T>(name: string, fn: () => T | null, tracker?: PerfTracker): T | null {
  const start = performance.now();
  const res = fn();
  const dur = performance.now() - start;
  tracker?.(name, dur, !!res, res ? "registry" : "fail");
  return res;
}

export function findComposerTextarea(tracker?: PerfTracker): Element | null {
  return track("findComposerTextarea", () => getHostAdapter().findComposerEditor(), tracker);
}

export function findSendButton(tracker?: PerfTracker): Element | null {
  return track("findSendButton", () => queryFirst("composer.send"), tracker);
}

export function findComposerResizeTarget(tracker?: PerfTracker): Element | null {
  return track("findComposerResizeTarget", () => getHostAdapter().findComposerResizeTarget(), tracker);
}

export function findComposerAnchor(tracker?: PerfTracker) {
  return track("findComposerAnchor", () => getHostAdapter().findComposerAnchor(), tracker);
}
