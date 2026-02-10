export function isDomException(e: unknown): e is DOMException {
  return typeof DOMException !== 'undefined' && e instanceof DOMException;
}

export function formatError(e: unknown): string {
  if (isDomException(e)) return `${e.name}: ${e.message}`;
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  try { return JSON.stringify(e); } catch { return String(e); }
}
