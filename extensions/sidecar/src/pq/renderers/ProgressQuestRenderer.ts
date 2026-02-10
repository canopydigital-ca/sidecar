export type ProgressQuestSummary = {
  level: number | null;
  className: string | null;
  race: string | null;
  gold: number | null;
  currentQuest: string | null;
  timePlayedSeconds: number | null;
};

export type ProgressQuestThemeTokens = {
  background: string;
  text: string;
  accent: string;
  border: string;
};

type DockToPqMessage =
  | { type: "pq:pause" }
  | { type: "pq:resume" }
  | { type: "pq:reset" }
  | { type: "pq:setMuted"; muted: boolean }
  | { type: "pq:setVisibility"; hidden: boolean }
  | { type: "pq:setTheme"; tokens: ProgressQuestThemeTokens }
  | { type: "pq:getSummary"; requestId: string }
  | { type: "pq:exportSave"; requestId: string }
  | { type: "pq:importSave"; requestId: string; data: unknown };

type PqToDockMessage =
  | { type: "pq:ready" }
  | { type: "pq:summary"; data: ProgressQuestSummary }
  | { type: "pq:response"; requestId: string; ok: true; data?: unknown }
  | { type: "pq:response"; requestId: string; ok: false; error: string }
  | { type: "pq:internalError"; error: string }
  | { type: "pq:uiAction"; action: string };

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export class ProgressQuestRenderer {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private bridgeListener: ((e: MessageEvent) => void) | null = null;
  private isReady = false;
  private commandQueue: DockToPqMessage[] = [];
  private expectedOrigin: string | null = null;
  private lastTheme: ProgressQuestThemeTokens | null = null;
  private pending = new Map<
    string,
    { resolve: (v: unknown) => void; reject: (e: Error) => void; timeoutId: number }
  >();

  onSummary: ((summary: ProgressQuestSummary) => void) | null = null;
  onError: ((error: string) => void) | null = null;
  onUiAction: ((action: string) => void) | null = null;

  isRunning(): boolean {
    return this.isReady && !!this.iframe;
  }

  mount(container: HTMLElement) {
    this.container = container;

    if (!this.iframe) {
      this.iframe = document.createElement("iframe");
      const hostUrl = chrome.runtime.getURL("dist/pq/pq-host.html");
      const url = new URL(hostUrl);

      url.searchParams.set("compact", "1");

      const isDark =
        document.documentElement.classList.contains("dark-theme") ||
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      url.searchParams.set("mode", isDark ? "dark" : "light");

      this.expectedOrigin = new URL(hostUrl).origin;
      this.iframe.src = url.toString();
      this.iframe.title = "ProgressQuest";
      this.iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-modals");
      this.iframe.setAttribute("referrerpolicy", "no-referrer");
      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        background-color: transparent;
        pointer-events: auto;
      `;
      this.iframe.setAttribute("allowtransparency", "true");

      this.setupBridge();
    }

    if (this.iframe.parentElement !== this.container) {
      this.container.appendChild(this.iframe);
    }

    if (this.lastTheme) {
      this.send({ type: "pq:setTheme", tokens: this.lastTheme });
    }
  }

  unmount() {
    if (this.bridgeListener) {
      window.removeEventListener("message", this.bridgeListener);
      this.bridgeListener = null;
    }

    for (const p of this.pending.values()) {
      window.clearTimeout(p.timeoutId);
      p.reject(new Error("ProgressQuestRenderer unmounted"));
    }
    this.pending.clear();
    this.commandQueue = [];
    this.isReady = false;

    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.container = null;
  }

  pause() {
    this.send({ type: "pq:pause" });
  }

  resume() {
    this.send({ type: "pq:resume" });
  }

  reset() {
    this.send({ type: "pq:reset" });
  }

  setMuted(muted: boolean) {
    this.send({ type: "pq:setMuted", muted });
  }

  setVisibility(hidden: boolean) {
    this.send({ type: "pq:setVisibility", hidden });
  }

  setTheme(tokens: ProgressQuestThemeTokens) {
    this.lastTheme = tokens;
    this.send({ type: "pq:setTheme", tokens });
  }

  getSummary(timeoutMs = 1500): Promise<ProgressQuestSummary> {
    return this.request<ProgressQuestSummary>("pq:getSummary", undefined, timeoutMs);
  }

  exportSave(timeoutMs = 3000): Promise<unknown> {
    return this.request("pq:exportSave", undefined, timeoutMs);
  }

  importSave(data: unknown, timeoutMs = 3000): Promise<void> {
    return this.request("pq:importSave", data, timeoutMs).then(() => undefined);
  }

  private request<T>(type: DockToPqMessage["type"], data?: unknown, timeoutMs = 1500): Promise<T> {
    const requestId = randomId("pqreq");
    const msg =
      type === "pq:importSave"
        ? ({ type, requestId, data } as DockToPqMessage)
        : ({ type, requestId } as DockToPqMessage);

    return new Promise<T>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error(`ProgressQuest request timed out: ${type}`));
      }, timeoutMs);
      this.pending.set(requestId, { resolve: resolve as any, reject, timeoutId });
      this.send(msg);
    });
  }

  private setupBridge() {
    this.bridgeListener = (event: MessageEvent) => {
      if (!this.iframe || !this.iframe.contentWindow) return;
      if (event.source !== this.iframe.contentWindow) return;
      const iframeOrigin = this.getTargetOrigin();
      if (iframeOrigin !== "*" && event.origin !== iframeOrigin) return;

      const data = event.data as any;
      if (!data || typeof data !== "object" || typeof data.type !== "string") return;
      if (!data.type.startsWith("pq:")) return;

      const msg = data as PqToDockMessage;

      if (msg.type === "pq:ready") {
        this.isReady = true;
        this.flushQueue();
        return;
      }

      if (msg.type === "pq:summary") {
        this.onSummary?.(msg.data);
        return;
      }

      if (msg.type === "pq:internalError") {
        console.warn("PQ Internal Error from Bridge:", msg.error);
        this.onError?.(msg.error);
        return;
      }

      if (msg.type === "pq:uiAction") {
        this.onUiAction?.(msg.action);
        return;
      }

      if (msg.type === "pq:response") {
        const pending = this.pending.get(msg.requestId);
        if (!pending) return;
        window.clearTimeout(pending.timeoutId);
        this.pending.delete(msg.requestId);
        if (msg.ok === true) {
          pending.resolve(msg.data);
        } else {
          pending.reject(new Error("error" in msg ? msg.error : "Unknown error"));
        }
      }
    };

    window.addEventListener("message", this.bridgeListener);
  }

  private getTargetOrigin(): string | "*" {
    const src = this.iframe?.src;
    if (!src) return this.expectedOrigin ?? "*";
    try {
      return new URL(src, window.location.href).origin;
    } catch {
      return this.expectedOrigin ?? "*";
    }
  }

  private send(command: DockToPqMessage) {
    if (!this.iframe || !this.iframe.contentWindow) return;

    if (!this.isReady) {
      this.commandQueue.push(command);
      return;
    }

    // We use "*" as targetOrigin because the iframe is sandboxed with allow-same-origin
    // and might be treated as opaque or have a different origin in some contexts,
    // causing "Failed to execute 'postMessage' ... target origin provided does not match" errors.
    // Since the content is public/static, "*" is acceptable here.
    this.iframe.contentWindow.postMessage(command, "*");
  }

  private flushQueue() {
    if (!this.iframe || !this.iframe.contentWindow) return;
    while (this.commandQueue.length > 0) {
      const cmd = this.commandQueue.shift();
      if (!cmd) continue;
      this.iframe.contentWindow.postMessage(cmd, "*");
    }
  }
}
