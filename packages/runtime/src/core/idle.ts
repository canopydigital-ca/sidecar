export const idle = (cb: unknown, timeout = 800): number => {
  const fn =
    typeof cb === "function"
      ? (cb as (deadline: IdleDeadline) => void)
      : (() => { });

  const ric = (window as any).requestIdleCallback;
  if (typeof ric === "function") {
    return ric(fn, { timeout });
  }

  return setTimeout(
    () => fn({ timeRemaining: () => 0, didTimeout: true } as IdleDeadline),
    0
  ) as unknown as number;
};
