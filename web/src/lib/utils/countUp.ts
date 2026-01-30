export type CountUpOpts = {
  from?: number;
  to: number;
  durationMs?: number;
  decimals?: number;
  reducedMotion?: boolean;
  onUpdate: (v: number) => void;
  onDone?: () => void;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function countUp(opts: CountUpOpts) {
  const { from = 0, to, durationMs = 900, decimals = 0, reducedMotion = false, onUpdate, onDone } = opts;

  const round = (v: number) => {
    const p = Math.pow(10, decimals);
    return Math.round(v * p) / p;
  };

  if (reducedMotion) {
    onUpdate(round(to));
    onDone?.();
    return { cancel() {} };
  }

  let raf = 0;
  const start = performance.now();

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const v = from + (to - from) * easeOutCubic(t);
    onUpdate(round(v));
    if (t < 1) raf = requestAnimationFrame(step);
    else onDone?.();
  };

  raf = requestAnimationFrame(step);
  return { cancel() { cancelAnimationFrame(raf); } };
}

export function formatNumber(v: number, decimals = 0) {
  return v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
