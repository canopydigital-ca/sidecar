type InViewOptions = IntersectionObserverInit & {
  once?: boolean;
  onEnter?: () => void;
};

export function inview(node: HTMLElement, opts: InViewOptions = {}) {
  const {
    once = true,
    onEnter,
    root = null,
    rootMargin = "0px",
    threshold = 0.15
  } = opts;

  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        node.dataset.inview = "true";
        onEnter?.();
        if (once) observer.unobserve(node);
      }
    }
  }, { root, rootMargin, threshold });

  observer.observe(node);
  return { destroy() { observer.disconnect(); } };
}
