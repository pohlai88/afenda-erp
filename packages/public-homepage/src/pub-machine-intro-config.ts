export const MACHINE_INTRO_SESSION_FLAG = "afenda_intro_seen";

/** Public static asset served from apps/erp/public/landing */
export const MACHINE_INTRO_SOURCE_IMAGE = "/landing/afenda-machine-pixel.png";

/** Lynx head crop within afenda-machine-pixel.png (normalized 0–1). */
export const MACHINE_INTRO_LYNX_CROP = {
  x: 0.26,
  y: 0.1,
  w: 0.48,
  h: 0.55,
} as const;

/** Eye centers within the sampled lynx crop (normalized 0–1). */
export const MACHINE_INTRO_EYE_CENTERS = [
  { x: 0.405, y: 0.518 },
  { x: 0.628, y: 0.518 },
] as const;

export const MACHINE_INTRO_TOTAL_MS = 5_200;

export const MACHINE_INTRO_CONTROLS = {
  speed: 1.74,
  density: 46_000,
  vision: 1.28,
} as const;
