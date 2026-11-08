// Device quality tiers for the WebGL swarm.
//
// Detection is a cheap heuristic run once (memory, cores, GPU string,
// pointer type), then drei's PerformanceMonitor steps the tier down at
// runtime if frames are actually slow. No `detect-gpu`: it fetches its
// benchmark tables from a CDN on every visit.
//
// The configurator never caps the drone count: the count IS the product
// (a buyer comparing 100 vs 300 must see 100 vs 300), and 300 points are
// cheap on any GPU. What costs on weak phones is fill rate — DPR, bloom,
// trails — so that is what the tiers trade away. The home page is a
// concept render, so its density does scale with the tier.

export type Tier = "high" | "mid" | "low";

export type QualityProfile = {
  tier: Tier;
  /** Device-pixel-ratio cap. */
  dpr: number;
  /** Drones in the home-page concept swarm. */
  homeDrones: number;
  /** Full-screen bloom pass (otherwise the sprite's own halo does the glow). */
  bloom: boolean;
  /** MSAA samples for the composer — only silhouettes need it. */
  multisampling: number;
  /**
   * Ghost copies drawn behind moving drones. 0 (the default) disables them:
   * real drones leave no trail to the eye — only long-exposure photographs
   * show one — and on screen a trail reads as fireworks, not drones.
   */
  trailSteps: number;
  stars: number;
  /** Mirror the swarm in the river (home page). */
  reflection: boolean;
};

export const PROFILES: Record<Tier, QualityProfile> = {
  high: {
    tier: "high",
    dpr: 2,
    homeDrones: 1600,
    bloom: true,
    multisampling: 4,
    trailSteps: 0,
    stars: 1800,
    reflection: true,
  },
  mid: {
    tier: "mid",
    dpr: 1.5,
    homeDrones: 900,
    bloom: true,
    multisampling: 0,
    trailSteps: 0,
    stars: 1000,
    reflection: true,
  },
  low: {
    tier: "low",
    dpr: 1,
    homeDrones: 360,
    bloom: false,
    multisampling: 0,
    trailSteps: 0,
    stars: 500,
    reflection: false,
  },
};

const ORDER: Tier[] = ["low", "mid", "high"];

export function stepDown(tier: Tier): Tier {
  return ORDER[Math.max(0, ORDER.indexOf(tier) - 1)];
}

function gpuString(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const value = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return String(value ?? "");
  } catch {
    return "";
  }
}

/** True when WebGL can be created at all. Cached. */
let webglCache: boolean | null = null;
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

/**
 * Initial tier guess. `?quality=low|mid|high` overrides it, which is how
 * the tiers are checked on a desktop.
 */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "mid";

  const override = new URLSearchParams(window.location.search).get("quality");
  if (override === "low" || override === "mid" || override === "high") return override;

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const gpu = gpuString().toLowerCase();

  // Software rendering, or GPUs common on budget Android handsets.
  if (/swiftshader|llvmpipe|software|mali-[4t]|mali-g(31|51|52)|adreno \(tm\) [345]\d\d|powervr/.test(gpu)) {
    return "low";
  }
  if (memory <= 3 || cores <= 4) return "low";
  if (coarse || memory <= 6) return "mid";
  return "high";
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
