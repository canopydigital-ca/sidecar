// Web Worker for background token estimation
// Fast heuristic token estimation without blocking main thread

interface TokenEstimateJob {
  id: string;
  text: string;
}

interface TokenEstimateResult {
  id: string;
  tokens: number;
}

// Fast heuristic token estimate (no deps, no lag)
function estimateTokensFast(text: string): number {
  const s = (text ?? '').trim();
  if (!s) return 0;

  const chars = s.length;
  const spaces = s.match(/\s+/g)?.length ?? 0;
  const punct = s.match(/[.,!?;:"'()\[\]{}<>/\\|@#$%^&*_+=~-]/g)?.length ?? 0;

  const base = Math.ceil(chars / 4);
  const structure = Math.ceil((spaces + punct) / 12);

  return Math.max(1, base + structure);
}

// Batch processing to avoid flooding
let batchQueue: TokenEstimateJob[] = [];
let batchTimeout: number | null = null;

function processBatch() {
  if (batchQueue.length === 0) return;

  const results: TokenEstimateResult[] = [];
  const processed = batchQueue.splice(0, 50); // Process in chunks

  for (const job of processed) {
    try {
      const tokens = estimateTokensFast(job.text);
      results.push({ id: job.id, tokens });
    } catch (error) {
      console.warn('Token estimation failed for job:', job.id, error);
      results.push({ id: job.id, tokens: 0 });
    }
  }

  self.postMessage({
    type: 'BATCH_RESULT',
    results
  });

  // Schedule next batch if more items
  if (batchQueue.length > 0) {
    batchTimeout = setTimeout(processBatch, 16) as unknown as number; // ~60fps
  } else {
    batchTimeout = null;
  }
}

self.onmessage = (event: MessageEvent) => {
  const { type, data } = event.data;

  switch (type) {
    case 'ESTIMATE_TOKENS':
      if (Array.isArray(data)) {
        // Add to batch queue
        batchQueue.push(...data);
        
        // Start processing if not already running
        if (!batchTimeout) {
          batchTimeout = setTimeout(processBatch, 0) as unknown as number;
        }
      } else if (data && typeof data.id === 'string' && typeof data.text === 'string') {
        // Single item - process immediately
        try {
          const tokens = estimateTokensFast(data.text);
          self.postMessage({
            type: 'SINGLE_RESULT',
            result: { id: data.id, tokens }
          });
        } catch (error) {
          console.warn('Token estimation failed:', error);
          self.postMessage({
            type: 'SINGLE_RESULT',
            result: { id: data.id, tokens: 0 }
          });
        }
      }
      break;

    case 'CANCEL_JOBS':
      // Clear pending jobs
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }
      batchQueue = [];
      break;

    default:
      console.warn('Unknown message type:', type);
  }
};

// Export for TypeScript module recognition
export {};