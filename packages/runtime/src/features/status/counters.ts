import { $$ } from "../../core/dom";
import { DockContext } from "../../core/context";

export function countWords(text: string) {
  const t = (text || "").trim();
  if (!t) return 0;
  return (t.match(/\S+/g) || []).length;
}

export function processMessageEl(el: Element, ctx: DockContext) {
  if (!el || ctx.statusState.processed.has(el)) return;
  ctx.statusState.processed.add(el);

  const role = (el.getAttribute("data-message-author-role") || "").toLowerCase();
  if (ctx.settings.statMessages) {
    if (role === "user") ctx.statusState.user += 1;
    else if (role === "assistant") ctx.statusState.ai += 1;
  }

  const txt = (el as HTMLElement).innerText || "";
  if (ctx.settings.statWords) ctx.statusState.words += countWords(txt);
  if (ctx.settings.statTokens) ctx.statusState.chars += txt.length;

  if (role === "user") ctx.statusState.userChars += txt.length;
  else if (role === "assistant") ctx.statusState.aiChars += txt.length;
}

export function processPendingMessages(deadline: IdleDeadline, ctx: DockContext) {
  let i = 0;
  while (ctx.statusState.pending.length && (deadline.timeRemaining() > 6 || deadline.didTimeout)) {
    processMessageEl(ctx.statusState.pending.shift()!, ctx);
    i += 1;
    if (i >= 14) break;
  }
  return ctx.statusState.pending.length > 0;
}

export function initStatusCounts(deadline: IdleDeadline, ctx: DockContext) {
  if (ctx.statusState.initDone) return false;
  const nodes = $$("[data-message-author-role]");
  let i = 0;
  while (i < nodes.length && (deadline.timeRemaining() > 6 || deadline.didTimeout)) {
    processMessageEl(nodes[i], ctx);
    i += 1;
    if (i % 18 === 0) break;
  }
  if (i < nodes.length) {
    for (let j = i; j < nodes.length; j++) ctx.statusState.pending.push(nodes[j]);
    ctx.statusState.initDone = true;
    return ctx.statusState.pending.length > 0;
  }
  ctx.statusState.initDone = true;
  return false;
}

export function queueMessageNodesFromMutations(mutations: MutationRecord[], ctx: DockContext) {
  if (!ctx.settings.statusbarOn) return;
  for (const m of mutations) {
    for (const n of Array.from(m.addedNodes)) {
      if (!n || n.nodeType !== 1) continue;
      const el = n as Element;
      if (el.matches?.("[data-message-author-role]")) ctx.statusState.pending.push(el);
      const inner = el.querySelectorAll?.("[data-message-author-role]");
      if (inner && inner.length) ctx.statusState.pending.push(...Array.from(inner));
    }
  }
}
