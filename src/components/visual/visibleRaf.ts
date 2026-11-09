// requestAnimationFrame that sleeps while its canvas is off-screen or the
// tab is hidden. The 2D swarm canvases (gallery cards, heroes) used to draw
// every frame forever — six gallery cards kept animating long after the
// visitor had scrolled past them, competing with whatever was on screen.
//
// Drop-in: replace `requestAnimationFrame(draw)` with `loop.request(draw)`
// and `cancelAnimationFrame(raf)` with `loop.cancel()`.

export function visibleRaf(el: Element) {
  let onScreen = true;
  let pageVisible = typeof document === "undefined" ? true : !document.hidden;
  let pending: FrameRequestCallback | null = null;
  let id = 0;

  const flush = () => {
    if (pending && onScreen && pageVisible) {
      const fn = pending;
      pending = null;
      id = requestAnimationFrame(fn);
    }
  };
  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      flush();
    },
    { rootMargin: "120px" }
  );
  io.observe(el);
  const onVisibility = () => {
    pageVisible = !document.hidden;
    flush();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    request(fn: FrameRequestCallback) {
      if (onScreen && pageVisible) id = requestAnimationFrame(fn);
      else pending = fn;
    },
    cancel() {
      cancelAnimationFrame(id);
      pending = null;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
