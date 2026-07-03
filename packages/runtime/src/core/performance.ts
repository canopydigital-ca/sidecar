import { log } from "./log";

export function createPerformanceTracker() {
  const selectorPerformance = new Map();

  return function trackSelectorPerformance(selectorName: string, duration: number, success: boolean, matchedSelector = '') {
    if (!selectorPerformance.has(selectorName)) {
      selectorPerformance.set(selectorName, {
        calls: 0,
        successes: 0,
        totalDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        lastMatchedSelector: ''
      });
    }

    const stats = selectorPerformance.get(selectorName);
    stats.calls++;
    stats.totalDuration += duration;
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.minDuration = Math.min(stats.minDuration, duration);

    if (success) {
      stats.successes++;
      stats.lastMatchedSelector = matchedSelector;
    }

    // Log slow selectors for optimization
    if (duration > 100) {
      log.debug(`Slow selector: ${selectorName} took ${duration.toFixed(1)}ms`);
    }
  };
}
