import { log } from "./log";

// Type definitions for Layout Instability API
// See: https://wicg.github.io/layout-instability/
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
  sources: LayoutShiftAttribution[];
}

interface LayoutShiftAttribution {
  node?: Node;
  previousRect: DOMRectReadOnly;
  currentRect: DOMRectReadOnly;
}

export interface ShiftRecord {
  value: number;
  timestamp: number;
  sources: string[];
}

export class LayoutShiftMonitor {
  private observer: PerformanceObserver | null = null;
  private shifts: ShiftRecord[] = [];
  private maxLogSize = 200;
  private isRunning = false;
  private windowStartTime = 0;
  private windowScore = 0;
  private static instance: LayoutShiftMonitor;

  private constructor() {
    // Singleton
  }

  public static getInstance(): LayoutShiftMonitor {
    if (!LayoutShiftMonitor.instance) {
      LayoutShiftMonitor.instance = new LayoutShiftMonitor();
    }
    return LayoutShiftMonitor.instance;
  }

  public start() {
    if (this.isRunning) return;
    
    // Feature detect
    if (typeof PerformanceObserver === 'undefined' || 
        !PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
      // Quietly fail if not supported (e.g. Firefox older versions)
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as LayoutShift[]) {
          this.processEntry(entry);
        }
      });
      this.observer.observe({ type: 'layout-shift', buffered: true });
      this.isRunning = true;
    } catch (e) {
      log.error("[CLS] Failed to start monitor", e);
    }
  }

  public stop() {
    if (!this.isRunning || !this.observer) return;
    this.observer.disconnect();
    this.isRunning = false;
  }

  private processEntry(entry: LayoutShift) {
    // Ignore shifts caused by user interaction (clicks, typing)
    if (entry.hadRecentInput) return;

    // Shift Guardrail: Track cumulative score in 1s window
    const now = entry.startTime;
    if (now - this.windowStartTime > 1000) {
        this.windowStartTime = now;
        this.windowScore = 0;
    }
    this.windowScore += entry.value;

    if (this.windowScore > 0.03) {
        log.debug(`[CLS] High Shift Score: ${this.windowScore.toFixed(4)} (Window 1s)`, this.shifts.slice(-3));
    }

    const sources = entry.sources?.map(s => {
      const node = s.node;
      if (node instanceof Element) {
        let desc = node.tagName.toLowerCase();
        if (node.id) desc += `#${node.id}`;
        if (node.className) {
            const classes = typeof node.className === 'string' ? node.className : '';
            if (classes) desc += `.${classes.split(' ').join('.')}`;
        }
        return desc;
      }
      return 'unknown';
    }) || [];

    const record: ShiftRecord = {
      value: entry.value,
      timestamp: entry.startTime,
      sources
    };

    this.shifts.push(record);
    if (this.shifts.length > this.maxLogSize) {
      this.shifts.shift();
    }

    // Log significant shifts for debugging
    if (entry.value > 0.05) {
        log.debug(`[CLS] Shift: ${entry.value.toFixed(4)}`, sources);
    }
  }

  public getSummary() {
    const totalShiftScore = this.shifts.reduce((sum, s) => sum + s.value, 0);
    const sourceMap = new Map<string, number>();

    this.shifts.forEach(s => {
      // Distribute score among sources
      const weight = s.value / (s.sources.length || 1);
      s.sources.forEach(src => {
        sourceMap.set(src, (sourceMap.get(src) || 0) + weight);
      });
      if (s.sources.length === 0) {
        sourceMap.set('unknown', (sourceMap.get('unknown') || 0) + s.value);
      }
    });

    const topSources = Array.from(sourceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, score]) => ({ source, score }));

    return {
      totalShiftScore,
      count: this.shifts.length,
      topSources,
      last10: this.shifts.slice(-10)
    };
  }

  public clear() {
    this.shifts = [];
    this.observer?.takeRecords();
  }
}

export const clsMonitor = LayoutShiftMonitor.getInstance();
