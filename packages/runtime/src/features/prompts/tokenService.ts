export class TokenService {
  private static instance: TokenService;
  private worker: Worker | null = null;
  private cache = new Map<string, number>();
  private pending = new Set<string>();
  private listeners = new Set<(id: string, count: number) => void>();

  private constructor() {
    if (typeof window !== "undefined") {
      try {
        // Worker initialization - tricky in IIFE/Extension context
        // For now, we'll try to use a static path if we can, or disable it to prevent "import.meta" syntax error
        // const workerUrl = new URL("./worker.ts", import.meta.url); 
        // this.worker = new Worker(workerUrl, { type: "module" });
        
        // Temporarily disabled to fix SyntaxError in content script build
        console.warn("TokenService worker disabled due to build constraints.");
        
        /*
        this.worker.onmessage = (event: MessageEvent) => {
          const { type, result, results } = event.data;

          if (type === "SINGLE_RESULT" && result) {
            this.update(result.id, result.tokens);
          } else if (type === "BATCH_RESULT" && Array.isArray(results)) {
            for (const res of results) {
              this.update(res.id, res.tokens);
            }
          }
        };
        */
      } catch (e) {
        console.warn("Failed to initialize TokenWorker:", e);
      }
    }
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  private update(id: string, tokens: number) {
    this.cache.set(id, tokens);
    this.pending.delete(id);
    this.notify(id, tokens);
  }

  public get(id: string): number | undefined {
    return this.cache.get(id);
  }

  public subscribe(callback: (id: string, count: number) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(id: string, count: number) {
    for (const listener of this.listeners) {
      listener(id, count);
    }
  }

  public queue(id: string, text: string) {
    if (this.cache.has(id) || this.pending.has(id)) return;
    
    // Heuristic: if very short, just do it here to save roundtrip overhead?
    // Actually, user wants "all worker-related logic... outside UI".
    // Let's stick to worker for consistency, or simple check.
    if (!text) {
      this.update(id, 0);
      return;
    }

    this.pending.add(id);
    this.worker?.postMessage({
      type: "ESTIMATE_TOKENS",
      data: { id, text }
    });
  }

  public queueBatch(items: Array<{ id: string; text: string }>) {
    const jobs = items.filter(i => !this.cache.has(i.id) && !this.pending.has(i.id));
    if (jobs.length === 0) return;

    for (const job of jobs) this.pending.add(job.id);

    this.worker?.postMessage({
      type: "ESTIMATE_TOKENS",
      data: jobs
    });
  }
}
