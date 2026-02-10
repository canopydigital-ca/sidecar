/**
 * Converts an ArrayBuffer to a Base64 string.
 * Optimized for large buffers by chunking to avoid stack overflow with String.fromCharCode.apply
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	const chunkSize = 0x8000; // 32KB chunks

	for (let i = 0; i < len; i += chunkSize) {
		const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
		// @ts-ignore - apply accepts typed array in modern JS engines or we cast to unknown
		binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
	}
	return btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary_string = atob(base64);
	const len = binary_string.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}

const PREFIX = "GZIP:";

/**
 * Compresses a string using GZIP and returns a Base64 string prefixed with "GZIP:".
 */
export async function compress(text: string): Promise<string> {
	if (!text) return "";

	try {
		if (typeof CompressionStream === 'undefined') {
			// Fallback for older environments: just Base64 encode to ensure safety
			// Not compressed, but safe from encoding issues.
			// We use a different prefix or just strict base64?
			// Let's just return raw text if we can't compress, or base64 it.
			// But user asked for compression.
			// Assuming modern Chrome (extension target).
			return text;
		}

		const enc = new TextEncoder();
		const data = enc.encode(text);

		const stream = new CompressionStream('gzip');
		const writer = stream.writable.getWriter();
		void writer.write(data);
		void writer.close();

		const buffer = await new Response(stream.readable).arrayBuffer();
		return PREFIX + arrayBufferToBase64(buffer);
	} catch (e) {
		console.error("Compression failed:", e);
		return text; // Fail safe
	}
}

/**
 * Decompresses a string. Handles legacy raw strings transparently.
 */
export async function decompress(str: string): Promise<string> {
	if (!str) return "";
	if (!str.startsWith(PREFIX)) return str; // Legacy/Raw

	try {
		const base64 = str.slice(PREFIX.length);
		const buffer = base64ToArrayBuffer(base64);

		const stream = new DecompressionStream('gzip');
		const writer = stream.writable.getWriter();
		void writer.write(buffer);
		void writer.close();

		return await new Response(stream.readable).text();
	} catch (e) {
		console.error("Decompression failed:", e);
		// If decompression fails, it might be corrupted. Return empty or raw?
		return "";
	}
}
