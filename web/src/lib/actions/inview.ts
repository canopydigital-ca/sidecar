type InViewOptions = IntersectionObserverInit & { once?: boolean };

export function inview(node: HTMLElement, opts: InViewOptions = {}) {
  const { once = true, root = null, rootMargin = "0px", threshold = 0.15 } = opts;

  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        node.dataset.inview = "true";
        node.dispatchEvent(new CustomEvent("inview"));
        if (once) observer.unobserve(node);
      }
    }
  }, { root, rootMargin, threshold });

  observer.observe(node);
  return { destroy() { observer.disconnect(); } };
}
