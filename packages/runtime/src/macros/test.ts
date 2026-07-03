// v0.1.0
import {
	Flow,
	act,
	retry,
	waitFor,
	waitForStableCount,
	isVisible,
	type Logger,
	hover,
	click,
} from "@/ui/flow";

type MacroOpts = {
	signal?: AbortSignal;
	logger?: Logger;
	targetProjectName?: string; // default "Web - Extension Development"
};

const SEL = {
	sidebar: "#stage-slideover-sidebar",
	openSidebarBtn: 'button[aria-label="Open sidebar"]',

	// "current chat" heuristics inside sidebar:
	currentChatLink: 'a[aria-current="page"], a[aria-current="true"]',

	// menus:
	menu: '[role="menu"]',
	menuItem: '[role="menuitem"]',
};

function menus(): HTMLElement[] {
	return Array.from(document.querySelectorAll<HTMLElement>(SEL.menu)).filter(isVisible);
}

async function waitForNewMenu(prevCount: number, signal?: AbortSignal, logger?: Logger) {
	return retry(
		() => {
			const ms = menus();
			if (ms.length <= prevCount) throw new Error(`menu count not increased: ${ms.length} <= ${prevCount}`);
			return ms[ms.length - 1]!;
		},
		{ timeoutMs: 3000, intervalMs: 50, signal, logger, name: "waitForNewMenu" },
	);
}

function closestRow(el: Element): HTMLElement {
	return (
		(el.closest("li") as HTMLElement | null) ??
		(el.closest('[role="listitem"]') as HTMLElement | null) ??
		(el.parentElement as HTMLElement | null) ??
		(el as HTMLElement)
	);
}

function findCurrentChatLinkFallback(sidebar: HTMLElement): HTMLAnchorElement | null {
	const path = location.pathname;
	const as = Array.from(sidebar.querySelectorAll<HTMLAnchorElement>("a[href]"));
	for (const a of as) {
		try {
			const url = new URL(a.href, location.origin);
			if (url.pathname === path) return a;
		} catch {
			// ignore
		}
	}
	return null;
}

function findMoreButtonInRow(row: HTMLElement): HTMLElement | null {
	const btns = Array.from(row.querySelectorAll<HTMLElement>("button"));
	const rx = /(more|options|menu|actions|ellipsis|overflow)/i;

	for (const b of btns) {
		const aria = b.getAttribute("aria-label") ?? "";
		const title = b.getAttribute("title") ?? "";
		const txt = (b.textContent ?? "").trim();
		const testid = b.getAttribute("data-testid") ?? "";

		if (rx.test(aria) || rx.test(title) || rx.test(testid) || txt === "…" || txt === "...") return b;
	}

	// extra attempt: some UIs use a plain icon button with no label, but nested svg.
	// If there's exactly one tiny icon-only button, pick it.
	const iconish = btns.filter((b) => (b.textContent ?? "").trim() === "" && b.querySelector("svg"));
	if (iconish.length === 1) return iconish[0] ?? null;

	return null;
}

async function openSidebarIfNeeded(signal?: AbortSignal, logger?: Logger) {
	const a = act({ signal, logger });

	const sb = document.querySelector<HTMLElement>(SEL.sidebar);
	if (sb && isVisible(sb) && sb.getBoundingClientRect().width > 40) return sb;

	await a.click(SEL.openSidebarBtn, { timeoutMs: 6000 });
	return waitFor<HTMLElement>(SEL.sidebar, { timeoutMs: 6000, signal, logger });
}

async function openContextMenuOnCurrentChat(
	sidebar: HTMLElement,
	signal?: AbortSignal,
	logger?: Logger,
): Promise<HTMLElement> {
	const a = act({ signal, logger }).withRoot(sidebar);

	const link = await retry(
		async () => {
			try {
				return (await a.find(SEL.currentChatLink, { timeoutMs: 800 })) as HTMLAnchorElement;
			} catch {
				const fb = findCurrentChatLinkFallback(sidebar);
				if (!fb) throw new Error("current chat link not found");
				return fb;
			}
		},
		{ timeoutMs: 6000, intervalMs: 100, signal, logger, name: "find current chat link" },
	);

	const row = closestRow(link);
	hover(row);

	// menu count before clicking "more"
	const before = menus().length;

	const moreBtn = await retry(
		() => {
			const b = findMoreButtonInRow(row);
			if (!b) throw new Error("more/options button not found in row");
			return b;
		},
		{ timeoutMs: 4000, intervalMs: 100, signal, logger, name: "find more button" },
	);

	click(moreBtn, { dispatchSequence: true });

	// Wait for menu to appear (new one if possible)
	const menu = await waitForNewMenu(before, signal, logger);
	return menu;
}

async function openMoveToProjectSubmenu(
	menu: HTMLElement,
	signal?: AbortSignal,
	logger?: Logger,
): Promise<HTMLElement> {
	const flowActor = act({ signal, logger }).withRoot(menu);

	// Best guess: the item text contains "Move to project"
	const moveItem = await flowActor.find(`${SEL.menuItem}, button, div`, {
		text: "move to project",
		caseSensitive: false,
		exact: false,
		timeoutMs: 4000,
	});

	const before = menus().length;

	// Try hover first (submenu)
	hover(moveItem);

	// If submenu didn't appear, click as fallback.
	let submenu: HTMLElement | null = null;
	try {
		submenu = await waitForNewMenu(before, signal, logger);
	} catch {
		click(moveItem, { dispatchSequence: true });
		submenu = await waitForNewMenu(before, signal, logger);
	}

	return submenu;
}

function projectItemText(el: Element) {
	return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

function isProbablyProjectEntry(el: Element) {
	const t = projectItemText(el).toLowerCase();
	if (!t) return false;
	// filter obvious non-project actions
	if (t.includes("new project")) return false;
	if (t.includes("create project")) return false;
	if (t.includes("manage")) return false;
	if (t.includes("settings")) return false;
	return true;
}

async function waitProjectsLoaded(submenu: HTMLElement, signal?: AbortSignal, logger?: Logger) {
	// Wait until we have at least 1 item, then wait for the count to settle.
	await retry(
		() => {
			const items = Array.from(submenu.querySelectorAll(SEL.menuItem)).filter(isProbablyProjectEntry);
			if (items.length < 1) throw new Error("no project entries yet");
			return items.length;
		},
		{ timeoutMs: 5000, intervalMs: 100, signal, logger, name: "projects appear" },
	);

	const stable = await waitForStableCount(SEL.menuItem, {
		root: submenu,
		timeoutMs: 5000,
		stableMs: 350,
		intervalMs: 75,
		signal,
		logger,
	});

	return stable;
}

async function chooseProject(
	submenu: HTMLElement,
	targetName: string,
	signal?: AbortSignal,
	logger?: Logger,
): Promise<boolean> {
	const a = act({ signal, logger }).withRoot(submenu);

	// 1) direct find by visible text
	try {
		const item = await a.find(SEL.menuItem, {
			text: targetName,
			caseSensitive: false,
			exact: false,
			timeoutMs: 2000,
		});
		click(item, { dispatchSequence: true });
		return true;
	} catch {
		// ignore and try search-input route
	}

	// 2) Some menus have a search box: type then retry find
	const input = submenu.querySelector<HTMLInputElement>('input[type="text"], input[type="search"]');
	if (input) {
		input.focus();
		input.value = "";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		input.value = targetName;
		input.dispatchEvent(new Event("input", { bubbles: true }));

		await retry(
			async () => {
				const item = await a.find(SEL.menuItem, {
					text: targetName,
					caseSensitive: false,
					exact: false,
					timeoutMs: 400,
				});
				click(item, { dispatchSequence: true });
				return true;
			},
			{ timeoutMs: 2500, intervalMs: 100, signal, logger, name: "find project after search" },
		);

		return true;
	}

	return false;
}

export async function macroMoveCurrentChatToProject(opts: MacroOpts = {}) {
	const target = opts.targetProjectName ?? "Web - Extension Development";
	const flow = new Flow({ signal: opts.signal, logger: opts.logger });

	const sidebar = await flow.step("ensure sidebar open", async () => {
		return openSidebarIfNeeded(opts.signal, opts.logger);
	});

	const menu = await flow.step("open context menu on current chat", async () => {
		return openContextMenuOnCurrentChat(sidebar, opts.signal, opts.logger);
	});

	const submenu = await flow.step("open Move to project submenu", async () => {
		return openMoveToProjectSubmenu(menu, opts.signal, opts.logger);
	});

	const count = await flow.step("wait for projects to load + settle", async ({ note }) => {
		const n = await waitProjectsLoaded(submenu, opts.signal, opts.logger);
		const items = Array.from(submenu.querySelectorAll(SEL.menuItem)).filter(isProbablyProjectEntry);
		note("project entries", { stableMenuItemCount: n, projectEntryCount: items.length });
		return items.length;
	});

	const ok = await flow.step(`choose project: ${target}`, async ({ note }) => {
		const did = await chooseProject(submenu, target, opts.signal, opts.logger);
		note("chooseProject result", { did, projectEntryCount: count });
		return did;
	});

	return { ok, projectCount: count };
}
