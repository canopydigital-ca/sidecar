/**
 * Lightweight, opt-in debug/perf instrumentation.
 *
 * Everything in this module is gated behind a localStorage flag and ships
 * disabled by default: with the flag unset every helper is a cheap no-op
 * (one cached boolean check), no PerformanceObserver is installed, and no
 * console output is produced.
 *
 * Enable from DevTools on the page under test:
 *   localStorage.cgptSidecarDebug = "1"
 * (the anchor-specific alias `cgptSidecarDebugAnchor` is also accepted)
 * then reload. Disable by removing the key.
 */

const DEBUG_KEYS = ["cgptSidecarDebug", "cgptSidecarDebugAnchor"] as const;
const FLAG_RECHECK_MS = 2000;

let _cachedEnabled = false;
let _cachedAt = Number.NEGATIVE_INFINITY;

function readDebugFlag(): boolean {
  try {
    for (const key of DEBUG_KEYS) {
      const value = window.localStorage.getItem(key);
      if (value === "1" || value === "true") return true;
    }
  } catch {
    // localStorage unavailable (sandboxed frame, privacy mode); stay disabled.
  }
  return false;
}

/**
 * Synchronous debug-flag check, safe to call from hot paths.
 * The localStorage read is cached and refreshed at most every 2s so toggling
 * the flag in DevTools takes effect without a reload for repeated callers.
 */
export function isSidecarDebugEnabled(): boolean {
  const now = Date.now();
  if (now - _cachedAt < FLAG_RECHECK_MS) return _cachedEnabled;
  _cachedAt = now;
  _cachedEnabled = readDebugFlag();
  return _cachedEnabled;
}

// --- performance.mark/measure around instrumented interactions ---

// Only log measured durations above this threshold to keep the console usable
// for interactions that run every frame (e.g. dock repositioning). All marks
// and measures are still recorded and visible in the Performance panel.
const LOG_DURATION_THRESHOLD_MS = 4;

let _markSeq = 0;

/**
 * Wraps a synchronous interaction in performance.mark/measure and starts a
 * layout-shift (CLS) accumulation bucket for it. No-op unless the debug flag
 * is set.
 */
export function measureInteraction<T>(name: string, fn: () => T): T {
  if (!isSidecarDebugEnabled() || typeof performance === "undefined" || typeof performance.mark !== "function") {
    return fn();
  }

  const id = ++_markSeq;
  const startMark = `cgpt:${name}:${id}:start`;
  const endMark = `cgpt:${name}:${id}:end`;

  beginClsBucket(name);
  performance.mark(startMark);
  try {
    return fn();
  } finally {
    performance.mark(endMark);
    try {
      const measure = performance.measure(`cgpt:${name}`, startMark, endMark);
      const duration = measure?.duration;
      if (typeof duration === "number" && duration >= LOG_DURATION_THRESHOLD_MS) {
        console.info(`[SidecarPerf] ${name}: ${duration.toFixed(2)}ms`);
      }
    } catch {
      // performance.measure signature unsupported; marks are still recorded.
    }
  }
}

// --- layout-shift (CLS) accumulation per interaction ---

// Chrome-only entry type; typed loosely to avoid lib.dom version coupling.
type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };

type ClsBucket = { name: string; value: number };

// How long after an interaction starts we keep attributing layout shifts to it.
const CLS_BUCKET_WINDOW_MS = 1000;

let _clsObserver: PerformanceObserver | null = null;
let _clsObserverFailed = false;
let _activeBucket: ClsBucket | null = null;
let _flushTimer: ReturnType<typeof setTimeout> | null = null;

function ensureClsObserver(): void {
  if (_clsObserver || _clsObserverFailed) return;
  if (typeof PerformanceObserver === "undefined") {
    _clsObserverFailed = true;
    return;
  }
  try {
    _clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (entry.hadRecentInput) continue;
        if (_activeBucket) _activeBucket.value += entry.value;
      }
    });
    _clsObserver.observe({ type: "layout-shift", buffered: false } as PerformanceObserverInit);
  } catch {
    // layout-shift entry type unsupported (e.g. Firefox); disable quietly.
    _clsObserver = null;
    _clsObserverFailed = true;
  }
}

function beginClsBucket(name: string): void {
  ensureClsObserver();
  if (!_clsObserver) return;
  flushClsBucket();
  _activeBucket = { name, value: 0 };
  _flushTimer = setTimeout(flushClsBucket, CLS_BUCKET_WINDOW_MS);
}

function flushClsBucket(): void {
  if (_flushTimer !== null) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
  const bucket = _activeBucket;
  _activeBucket = null;
  if (bucket && bucket.value > 0) {
    console.info(`[SidecarPerf] CLS(${bucket.name}): ${bucket.value.toFixed(4)}`);
  }
}
