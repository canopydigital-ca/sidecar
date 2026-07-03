import { RegistryKey } from "../core/registry";
import { queryFirst } from "../core/dom/query";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type Logger = (level: LogLevel, msg: string, meta?: unknown) => void;

export type FlowEvent =
	| { type: "step:start"; name: string; t: number }
	| { type: "step:done"; name: string; t: number; ms: number }
	| { type: "step:fail"; name: string; t: number; ms: number; error: unknown }
	| { type: "note"; t: number; msg: string; meta?: unknown };

export type WaitOpts = {
	timeoutMs?: number;
	root?: ParentNode;
	signal?: AbortSignal;
	logger?: Logger;
};

export type RetryOpts = {
	timeoutMs?: number;
	intervalMs?: number;
	signal?: AbortSignal;
	logger?: Logger;
	name?: string;
};

export type FindTextOpts = {
	root?: ParentNode;
	timeoutMs?: number;
	signal?: AbortSignal;
	logger?: Logger;

	text?: string;
	exact?: boolean;
	caseSensitive?: boolean;
	normalizeWhitespace?: boolean;
	includeAriaLabel?: boolean;
	includeTitle?: boolean;
};

export type ClickOpts = {
	scroll?: boolean;
	center?: boolean;
	dispatchSequence?: boolean;
};

export type HoverOpts = {
	scroll?: boolean;
	center?: boolean;
	// dispatch pointer/mouse over + move events
	dispatchSequence?: boolean;
};

export type TypeOpts = {
	clearFirst?: boolean;
	replace?: boolean;
};

export type StepCtx = {
	signal?: AbortSignal;
	log: Logger;
	now: () => number;
	note: (msg: string, meta?: unknown) => void;
};

export type StepFn<T> = (ctx: StepCtx) => Promise<T>;

export function defaultLogger(level: LogLevel, msg: string, meta?: unknown) {
	if (level === "debug") return;
	// eslint-disable-next-line no-console
	console[level](`[flow] ${msg}`, meta ?? "");
}

function throwIfAborted(signal?: AbortSignal) {
	if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		throwIfAborted(signal);
		const t = window.setTimeout(resolve, ms);
		signal?.addEventListener(
			"abort",
			() => {
				window.clearTimeout(t);
				reject(new DOMException("Aborted", "AbortError"));
			},
			{ once: true },
		);
	});
}

export function normalizeText(s: string, normalizeWhitespace = true) {
	const t = s ?? "";
	if (!normalizeWhitespace) return t;
	return t.replace(/\s+/g, " ").trim();
}

export function isVisible(el: Element) {
	const he = el as HTMLElement;
	if (!he) return false;
	const rect = he.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) return false;
	const style = window.getComputedStyle(he);
	if (style.visibility === "hidden" || style.display === "none") return false;
	return true;
}

export async function retry<T>(fn: () => T | Promise<T>, opts: RetryOpts = {}): Promise<T> {
	const {
		timeoutMs = 4000,
		intervalMs = 50,
		signal,
		logger = defaultLogger,
		name = "retry",
	} = opts;

	const start = performance.now();
	let lastErr: unknown;

	while (performance.now() - start < timeoutMs) {
		throwIfAborted(signal);
		try {
			return await fn();
		} catch (e) {
			lastErr = e;
			await sleep(intervalMs, signal);
		}
	}

	logger("error", `${name} timed out after ${timeoutMs}ms`, lastErr);
	throw lastErr instanceof Error ? lastErr : new Error(`${name} timed out`);
}

export function waitFor<T extends Element>(
	selector: string,
	opts: WaitOpts = {},
): Promise<T> {
	const { timeoutMs = 4000, root = document, signal, logger = defaultLogger } = opts;

	return new Promise((resolve, reject) => {
		throwIfAborted(signal);

		const found = root.querySelector(selector) as T | null;
		if (found) return resolve(found);

		const obs = new MutationObserver(() => {
			const el = root.querySelector(selector) as T | null;
			if (el) {
				cleanup();
				resolve(el);
			}
		});

		const t = window.setTimeout(() => {
			cleanup();
			const err = new Error(`waitFor timeout: ${selector} (${timeoutMs}ms)`);
			logger("error", err.message);
			reject(err);
		}, timeoutMs);

		const onAbort = () => {
			cleanup();
			reject(new DOMException("Aborted", "AbortError"));
		};

		function cleanup() {
			obs.disconnect();
			window.clearTimeout(t);
			signal?.removeEventListener("abort", onAbort);
		}

		signal?.addEventListener("abort", onAbort, { once: true });
		obs.observe(root, { childList: true, subtree: true });
	});
}

/**
 * Waits for an element defined by a RegistryKey.
 * Uses queryFirst to resolve the element.
 */
export function waitForKey<T extends Element = Element>(
	key: RegistryKey,
	opts: WaitOpts = {},
): Promise<T> {
	const { timeoutMs = 4000, root = document, signal, logger = defaultLogger } = opts;

	return new Promise((resolve, reject) => {
		throwIfAborted(signal);

		// 1. Try immediate
		const el = queryFirst(key, root as Element | Document) as T | null;
		if (el) return resolve(el);

		// 2. Observe
		const obs = new MutationObserver(() => {
			const el = queryFirst(key, root as Element | Document) as T | null;
			if (el) {
				cleanup();
				resolve(el);
			}
		});

		const t = window.setTimeout(() => {
			cleanup();
			const err = new Error(`waitForKey timeout: ${key} (${timeoutMs}ms)`);
			logger("error", err.message);
			reject(err);
		}, timeoutMs);

		const onAbort = () => {
			cleanup();
			reject(new DOMException("Aborted", "AbortError"));
		};

		function cleanup() {
			obs.disconnect();
			window.clearTimeout(t);
			signal?.removeEventListener("abort", onAbort);
		}

		signal?.addEventListener("abort", onAbort, { once: true });
		obs.observe(root, { childList: true, subtree: true });
	});
}

export function queryAll(root: ParentNode, selector: string): Element[] {
	return Array.from(root.querySelectorAll(selector));
}

export function matchByText(
	el: Element,
	text: string,
	opts: Omit<FindTextOpts, "root" | "timeoutMs" | "signal" | "logger">,
) {
	const {
		exact = false,
		caseSensitive = false,
		normalizeWhitespace: nws = true,
		includeAriaLabel = true,
		includeTitle = true,
	} = opts;

	const needleRaw = nws ? normalizeText(text, true) : text;
	const needle = caseSensitive ? needleRaw : needleRaw.toLowerCase();

	const candidates: string[] = [];
	candidates.push(el.textContent ?? "");
	if (includeAriaLabel) candidates.push(el.getAttribute("aria-label") ?? "");
	if (includeTitle) candidates.push(el.getAttribute("title") ?? "");

	for (const c of candidates) {
		const hayRaw = nws ? normalizeText(c, true) : c;
		const hay = caseSensitive ? hayRaw : hayRaw.toLowerCase();
		if (exact ? hay === needle : hay.includes(needle)) return true;
	}
	return false;
}

export async function find(
	selector: string,
	opts: FindTextOpts = {},
): Promise<Element> {
	const {
		root = document,
		timeoutMs = 4000,
		signal,
		logger = defaultLogger,
		text,
		...textOpts
	} = opts;

	return retry(
		() => {
			throwIfAborted(signal);
			const els = queryAll(root, selector);
			if (!els.length) throw new Error(`No matches for selector: ${selector}`);

			if (text == null) return els[0];

			const hit = els.find((el) => matchByText(el, text, textOpts));
			if (!hit) throw new Error(`No matches for selector "${selector}" with text "${text}"`);
			return hit;
		},
		{ timeoutMs, intervalMs: 50, signal, logger, name: `find(${selector})` },
	);
}

export function ensureInteractable(el: Element) {
	const he = el as HTMLElement;
	if (!he) throw new Error("Not an HTMLElement");

	const disabled =
		(he as HTMLButtonElement).disabled === true ||
		he.getAttribute("aria-disabled") === "true";

	if (disabled) throw new Error("Element is disabled");
	if (!isVisible(he)) throw new Error("Element not visible");
	return he;
}

function elementCenter(he: HTMLElement) {
	const rect = he.getBoundingClientRect();
	const cx = Math.floor(rect.left + rect.width / 2);
	const cy = Math.floor(rect.top + rect.height / 2);
	return { cx, cy };
}

function dispatchMouseSequence(he: HTMLElement) {
	const { cx, cy } = elementCenter(he);
	const evInit: MouseEventInit = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
	he.dispatchEvent(new MouseEvent("pointerdown", evInit));
	he.dispatchEvent(new MouseEvent("mousedown", evInit));
	he.dispatchEvent(new MouseEvent("pointerup", evInit));
	he.dispatchEvent(new MouseEvent("mouseup", evInit));
	he.dispatchEvent(new MouseEvent("click", evInit));
}

function dispatchHoverSequence(he: HTMLElement) {
	const { cx, cy } = elementCenter(he);
	const moveInit: MouseEventInit = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
	// Order matters for some frameworks.
	he.dispatchEvent(new MouseEvent("pointerover", moveInit));
	he.dispatchEvent(new MouseEvent("mouseover", moveInit));
	he.dispatchEvent(new MouseEvent("mousemove", moveInit));
	he.dispatchEvent(new MouseEvent("pointermove", moveInit));
	he.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false, cancelable: true, clientX: cx, clientY: cy }));
}

export function click(el: Element, opts: ClickOpts = {}) {
	const { scroll = true, center = true, dispatchSequence = false } = opts;
	const he = ensureInteractable(el);

	if (scroll) {
		he.scrollIntoView({
			block: center ? "center" : "nearest",
			inline: center ? "center" : "nearest",
		});
	}

	if (dispatchSequence) dispatchMouseSequence(he);
	else he.click();
}

export function hover(el: Element, opts: HoverOpts = {}) {
	const { scroll = true, center = true, dispatchSequence = true } = opts;
	const he = ensureInteractable(el);

	if (scroll) {
		he.scrollIntoView({
			block: center ? "center" : "nearest",
			inline: center ? "center" : "nearest",
		});
	}

	if (dispatchSequence) dispatchHoverSequence(he);
}

function dispatchInputEvents(target: HTMLElement) {
	try {
		target.dispatchEvent(new InputEvent("input", { bubbles: true }));
	} catch {
		target.dispatchEvent(new Event("input", { bubbles: true }));
	}
	target.dispatchEvent(new Event("change", { bubbles: true }));
}

export function typeInto(el: Element, text: string, opts: TypeOpts = {}) {
	const { clearFirst = false, replace = true } = opts;
	const he = ensureInteractable(el);
	he.focus();

	if (he.isContentEditable) {
		if (clearFirst) he.textContent = "";
		const canExec = typeof document.execCommand === "function";
		if (canExec) document.execCommand("insertText", false, text);
		else he.textContent = (he.textContent ?? "") + text;
		dispatchInputEvents(he);
		return;
	}

	const tag = he.tagName.toLowerCase();
	if (tag === "input" || tag === "textarea") {
		const input = he as HTMLInputElement | HTMLTextAreaElement;
		const cur = input.value ?? "";
		const next = clearFirst ? text : replace ? text : cur + text;
		input.value = next;
		dispatchInputEvents(input);
		return;
	}

	if (clearFirst) he.textContent = "";
	he.textContent = (he.textContent ?? "") + text;
	dispatchInputEvents(he);
}

export async function waitForStableCount(
	selector: string,
	opts: {
		root?: ParentNode;
		timeoutMs?: number;
		stableMs?: number;
		intervalMs?: number;
		signal?: AbortSignal;
		logger?: Logger;
	} = {},
): Promise<number> {
	const {
		root = document,
		timeoutMs = 4000,
		stableMs = 250,
		intervalMs = 50,
		signal,
		logger = defaultLogger,
	} = opts;

	const start = performance.now();
	let last = -1;
	let stableSince = performance.now();

	while (performance.now() - start < timeoutMs) {
		throwIfAborted(signal);
		const n = root.querySelectorAll(selector).length;

		if (n !== last) {
			last = n;
			stableSince = performance.now();
		} else if (performance.now() - stableSince >= stableMs) {
			return n;
		}

		await sleep(intervalMs, signal);
	}

	logger("warn", `waitForStableCount timeout: ${selector}`);
	return root.querySelectorAll(selector).length;
}

export class Flow {
	private readonly log: Logger;
	private readonly signal?: AbortSignal;
	private readonly onEvent?: (e: FlowEvent) => void;

	constructor(opts: { logger?: Logger; signal?: AbortSignal; onEvent?: (e: FlowEvent) => void } = {}) {
		this.log = opts.logger ?? defaultLogger;
		this.signal = opts.signal;
		this.onEvent = opts.onEvent;
	}

	private emit(e: FlowEvent) {
		this.onEvent?.(e);
	}

	note(msg: string, meta?: unknown) {
		this.emit({ type: "note", t: performance.now(), msg, meta });
		this.log("debug", msg, meta);
	}

	async step<T>(name: string, fn: StepFn<T>): Promise<T> {
		throwIfAborted(this.signal);
		const t0 = performance.now();
		this.log("info", `step: ${name}`);
		this.emit({ type: "step:start", name, t: t0 });

		try {
			const res = await fn({
				signal: this.signal,
				log: this.log,
				now: () => performance.now(),
				note: (msg, meta) => this.note(msg, meta),
			});
			const dt = Math.round(performance.now() - t0);
			this.log("info", `done: ${name} (${dt}ms)`);
			this.emit({ type: "step:done", name, t: performance.now(), ms: dt });
			return res;
		} catch (e) {
			const dt = Math.round(performance.now() - t0);
			this.log("error", `fail: ${name} (${dt}ms)`, e);
			this.emit({ type: "step:fail", name, t: performance.now(), ms: dt, error: e });
			throw e;
		}
	}
}

export class Actor {
	private readonly root: ParentNode;
	private readonly logger: Logger;
	private readonly signal?: AbortSignal;

	constructor(opts: { root?: ParentNode; logger?: Logger; signal?: AbortSignal } = {}) {
		this.root = opts.root ?? document;
		this.logger = opts.logger ?? defaultLogger;
		this.signal = opts.signal;
	}

	withRoot(root: ParentNode) {
		return new Actor({ root, logger: this.logger, signal: this.signal });
	}

	async wait(selector: string, timeoutMs = 4000) {
		return waitFor(selector, { root: this.root, timeoutMs, signal: this.signal, logger: this.logger });
	}

	async find(selector: string, opts: Omit<FindTextOpts, "root" | "signal" | "logger"> = {}) {
		return find(selector, { root: this.root, signal: this.signal, logger: this.logger, ...opts });
	}

	async click(selector: string, opts: FindTextOpts & ClickOpts = {}) {
		const el = await find(selector, { root: this.root, signal: this.signal, logger: this.logger, ...opts });
		click(el, opts);
		return el;
	}

	async hover(selector: string, opts: FindTextOpts & HoverOpts = {}) {
		const el = await find(selector, { root: this.root, signal: this.signal, logger: this.logger, ...opts });
		hover(el, opts);
		return el;
	}

	async type(selector: string, text: string, opts: FindTextOpts & TypeOpts = {}) {
		const el = await find(selector, { root: this.root, signal: this.signal, logger: this.logger, ...opts });
		typeInto(el, text, opts);
		return el;
	}
}

export function act(opts: ConstructorParameters<typeof Actor>[0] = {}) {
	return new Actor(opts);
}
