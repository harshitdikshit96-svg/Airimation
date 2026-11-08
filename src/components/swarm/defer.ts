// When to start the (heavy) 3D bundle. Never before the page has loaded:
// three + R3F + postprocessing initialising during load would compete with
// the copy for the main thread and show up as blocking time.

/**
 * Run `cb` once, at the first of:
 *   - the visitor engaging (scroll, wheel, pointer, key) after page load
 *   - `idleMs` of idle time after page load
 * Engagement is the strong signal on the home page: the scroll story only
 * starts moving once they scroll anyway.
 */
export function onEngageOrIdle(cb: () => void, idleMs = 3500): () => void {
  let done = false;
  let timer = 0;
  let idleId = 0;
  const events = ["scroll", "wheel", "pointerdown", "touchstart", "keydown"] as const;

  const fire = () => {
    if (done) return;
    done = true;
    cleanup();
    // Outside the event's own task, so it never counts against the
    // interaction that triggered it.
    window.setTimeout(cb, 0);
  };
  const arm = () => {
    events.forEach((e) => window.addEventListener(e, fire, { passive: true, once: true }));
    timer = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(fire, { timeout: 1500 });
      else fire();
    }, idleMs);
  };
  function cleanup() {
    events.forEach((e) => window.removeEventListener(e, fire));
    window.removeEventListener("load", arm);
    window.clearTimeout(timer);
    if (idleId) window.cancelIdleCallback(idleId);
  }

  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
  return () => {
    done = true;
    cleanup();
  };
}

/**
 * Run `cb` once the page has loaded, gone idle, and `el` is within ~300px
 * of view. The idle wait keeps the 3D chunk clear of the page's own
 * Largest Contentful Paint.
 */
export function onLoadedAndNear(el: Element, cb: () => void): () => void {
  let io: IntersectionObserver | null = null;
  let idleId = 0;
  const idleThenWatch = () => {
    if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(watch, { timeout: 1500 });
    else watch();
  };
  const watch = () => {
    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io?.disconnect();
        cb();
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
  };
  if (document.readyState === "complete") idleThenWatch();
  else window.addEventListener("load", idleThenWatch, { once: true });
  return () => {
    window.removeEventListener("load", idleThenWatch);
    if (idleId) window.cancelIdleCallback(idleId);
    io?.disconnect();
  };
}
