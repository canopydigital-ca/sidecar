import { queryFirst } from "../../core/dom";

export type PerfTracker = (name: string, duration: number, success: boolean, info?: string) => void;

function track(name: string, fn: () => Element | null, tracker?: PerfTracker): Element | null {
  const start = performance.now();
  const res = fn();
  const dur = performance.now() - start;
  tracker?.(name, dur, !!res, res ? "registry" : "fail");
  return res;
}

export function findComposerTextarea(tracker?: PerfTracker): Element | null {
  return track("findComposerTextarea", () => queryFirst("composer.editor"), tracker);
}

export function findSendButton(tracker?: PerfTracker): Element | null {
  return track("findSendButton", () => queryFirst("composer.send"), tracker);
}

export function findComposerResizeTarget(tracker?: PerfTracker): Element | null {
  return track("findComposerResizeTarget", () => {
    const editor = queryFirst("composer.editor");
    return editor ? editor.parentElement : null;
  }, tracker);
}

export function findComposerAnchor(tracker?: PerfTracker) {
  let target = queryFirst("composer.form");

  if (!target) {
    const editor = queryFirst("composer.editor");
    if (editor) {
      target = editor.closest('.wcDTda_prosemirror-parent');
      if (!target) target = editor.parentElement;
    }
  }

  if (target && target.parentElement) {
    return { anchor: target, parent: target.parentElement };
  }

  const bottom = queryFirst("thread.bottomContainer");
  if (bottom && bottom.parentElement) {
    return { anchor: bottom, parent: bottom.parentElement };
  }

  return null;
}
