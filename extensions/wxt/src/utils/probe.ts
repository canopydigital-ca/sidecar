// utils/probe.ts
export async function probeSelector(tabId: number, selector: string) {
	try {
		const results = await browser.scripting.executeScript({
			target: { tabId },
			func: (sel: string) => ({ ok: !!document.querySelector(sel), href: location.href }),
			args: [selector],
		});

		return results?.[0]?.result?.ok ?? false;
	} catch {
		// no permission or unsupported API
		return null; // null = "can't check here"
	}
}
