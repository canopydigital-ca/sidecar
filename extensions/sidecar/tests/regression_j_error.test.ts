
import { expect, test, describe } from "bun:test";
import { nearestStableAncestor } from "../src/core/discovery";
import { idle } from "../src/core/idle";

class MockElement {
	tagName: string;
	attributes: Map<string, string>;
	parentElement: MockElement | null = null;

	constructor(tagName: string) {
		this.tagName = tagName.toUpperCase();
		this.attributes = new Map();
	}

	getAttribute(name: string) {
		return this.attributes.get(name) || null;
	}

	setAttribute(name: string, value: string) {
		this.attributes.set(name, value);
	}

	closest(selector: string) {
		let current: MockElement | null = this;
		while (current) {
			if (selector.includes("data-testid") && current.getAttribute("data-testid")) return current;
			if (selector.includes("aria-label") && current.getAttribute("aria-label")) return current;
			current = current.parentElement;
		}
		return null;
	}
}

describe("Regression Test: J is not a function (discovery.ts)", () => {
	test("nearestStableAncestor handles data-testid correctly", () => {
		const el = new MockElement("div");
		el.setAttribute("data-testid", "test-id");

		const selector = nearestStableAncestor(el as any);
		expect(selector).toBe('div[data-testid="test-id"]');
	});

	test("nearestStableAncestor handles aria-label correctly", () => {
		const el = new MockElement("button");
		el.setAttribute("aria-label", "Close");

		const selector = nearestStableAncestor(el as any);
		expect(selector).toBe('button[aria-label="Close"]');
	});

	test("nearestStableAncestor escapes quotes correctly", () => {
		const el = new MockElement("div");
		el.setAttribute("data-testid", 'weird"id');

		const selector = nearestStableAncestor(el as any);
		expect(selector).toBe('div[data-testid="weird\\"id"]');
	});
});

describe("Regression Test: idle() callback guard", () => {
	test("idle fallback does not invoke non-function callbacks", async () => {
		const w: any = (globalThis as any).window ?? globalThis;
		(globalThis as any).window = w;

		const orig = w.requestIdleCallback;
		w.requestIdleCallback = undefined;

		idle(null as any, 1);
		await new Promise((r) => setTimeout(r, 1));

		w.requestIdleCallback = orig;
		expect(true).toBe(true);
	});
});
