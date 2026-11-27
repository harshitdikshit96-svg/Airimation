/**
 * Height of the Design a Show sky: the first screen less the header (64 px)
 * and the control dock under it, so every control is visible without
 * scrolling. The dock is rows of 44 px controls, 12 px apart (8 px between a
 * rail's label line and its chips on phones), plus 32 px padding:
 *   lg+   3 rows (Theme·Fleet·Share·Pause, formations, hues)        = 188 px
 *   md    4 rows (Share/Pause wrap under Theme·Fleet)               = 244 px
 *   sm    5 rows (Theme, Fleet, Share/Pause stack; rails one row)   = 300 px
 *   phone 7 rows (as sm, and each rail is a label line over chips)  = 404 px
 * Shared with the loading placeholder so nothing jumps when the 3D loads.
 */
export const SKY_HEIGHT = [
  "h-[calc(100svh-64px-404px)] min-h-[280px]",
  "sm:h-[calc(100svh-64px-300px)] sm:min-h-[340px]",
  "md:h-[calc(100svh-64px-244px)] md:min-h-[400px]",
  "lg:h-[calc(100svh-64px-188px)]",
].join(" ");
