// Point shaders for the drone swarm.
//
// Two overlaid THREE.Points layers share one position buffer AND one colour
// buffer: a large soft halo and a small bright core, both additively blended.
//
// COLOUR NOTE: the site's 2D swarm work ended on a strict white-only rule,
// because an earlier multi-colour version read as "blurry bokeh" rather than
// a drone show. That diagnosis was really about two things — a ~7x size
// spread and four-colour-per-phase confetti — not about colour itself. Real
// LED drones are vividly coloured. So colour is back, but under discipline:
// tight uniform point sizes, and one coherent palette per formation rather
// than per-drone randomness.
//
// No bloom post-processing: additive blending produces the glow at zero
// full-screen cost, which matters on the mid-range Android phones a real
// prospect will be holding.

export const pointVertexShader = /* glsl */ `
  attribute vec3 aColor;

  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMinPixels;
  uniform float uMaxPixels;

  varying vec3 vColor;

  void main() {
    vColor = aColor;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;

    // Perspective attenuation, clamped at both ends: distant drones must
    // stay visible rather than vanishing, near drones must not become blobs.
    float size = uSize * uPixelRatio * (300.0 / max(-mv.z, 1.0));
    gl_PointSize = clamp(size, uMinPixels * uPixelRatio, uMaxPixels * uPixelRatio);
  }
`;

export const pointFragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uSoftness;

  varying vec3 vColor;

  void main() {
    vec2 offset = gl_PointCoord - vec2(0.5);
    float d = length(offset) * 2.0;
    if (d > 1.0) discard;

    // uSoftness 0 = hard-edged core, 1 = wide soft halo.
    float falloff = pow(1.0 - d, mix(0.9, 3.2, uSoftness));
    gl_FragColor = vec4(vColor, falloff * uOpacity);
  }
`;
