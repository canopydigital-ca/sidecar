export function detectNetworkCondition() {
  // Simple heuristic based on navigation timing
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;

    if (loadTime > 5000) return 'slow';
    if (loadTime > 3000) return 'moderate';
  }

  // Check if we're offline
  if (!navigator.onLine) return 'offline';

  // Check connection type if available
  if ((navigator as any).connection) {
    const conn = (navigator as any).connection;
    if (conn.effectiveType && conn.effectiveType.includes('2g')) return 'slow';
    if (conn.effectiveType && conn.effectiveType.includes('3g')) return 'moderate';
  }

  return 'good';
}

export function getRetryConfig(networkCondition: string) {
  const configs: any = {
    good: { maxRetries: 2, baseDelay: 100 },
    moderate: { maxRetries: 3, baseDelay: 200 },
    slow: { maxRetries: 5, baseDelay: 500 },
    offline: { maxRetries: 1, baseDelay: 1000 }
  };

  return configs[networkCondition] || configs.good;
}
