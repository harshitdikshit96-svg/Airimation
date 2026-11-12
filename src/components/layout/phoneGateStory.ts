// The phone gate's self-playing version of the home story: no scroll on a
// phone, so a slow timeline drives the same beats instead.
//
//   0 ground hold (lit, as on the poster) -> rise through sheet and open sky
//   -> lotus -> AIRIMATION wordmark, then a gentle loop:
//   wordmark -> open-sky cloud -> lotus -> wordmark -> ...
//
// Beats: 0 ground, 1 sheet, 2 cloud, 3 lotus, 3.9999 wordmark (HomeSwarm).

const WORDMARK = 3.9999;

/** [seconds, beat to reach]. Each step eases from the previous beat. */
type Step = [number, number];

const INTRO: Step[] = [
  [3, 0], // ground hold, matching the poster the scene fades in over
  [12, 3], // lift-off, open sky, lotus
  [4, 3],
  [5, WORDMARK],
  [6, WORDMARK],
];
const LOOP: Step[] = [
  [6, 2],
  [3, 2],
  [5, 3],
  [4, 3],
  [5, WORDMARK],
  [6, WORDMARK],
];

const total = (steps: Step[]) => steps.reduce((s, [d]) => s + d, 0);
export const INTRO_SECONDS = total(INTRO);
export const LOOP_SECONDS = total(LOOP);

const ease = (x: number) => x * x * (3 - 2 * x);

function play(steps: Step[], start: number, t: number): number {
  let from = start;
  for (const [d, to] of steps) {
    if (t < d) return from + (to - from) * ease(t / d);
    t -= d;
    from = to;
  }
  return from;
}

/** Story beat `seconds` after the live scene appears. */
export function gateBeat(seconds: number): number {
  const t = Math.max(0, seconds);
  if (t < INTRO_SECONDS) return play(INTRO, 0, t);
  return play(LOOP, WORDMARK, (t - INTRO_SECONDS) % LOOP_SECONDS);
}
