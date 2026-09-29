// Point shaders for the drone swarm.
//
// Drones are drawn as two overlaid THREE.Points layers sharing one position
// buffer: a large soft halo and a small bright core, both additively
// blended. This is the two-layer treatment already validated on the site's
// 2D canvas, lifted into 3D.
//
// No bloom post-processing. Additive blending produces the glow directly at
// zero full-screen cost, and bloom is the most likely cause of frame drops
// on the mid-range Android phones a real prospect will be using. If the
// result ever looks flat, revisit bloom as a measured enhancement — never
// as a default.
//
// No texture either: the fragment shader draws a soft disc procedurally
// from gl_PointCoord, so there is no image to load or cache.

export const pointVertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMinPixels;
  uniform float uMaxPixels;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;

    // Perspective attenuation, clamped at both ends: distant drones must
    // stay visible rather than vanishing, near drones must not become blobs.
    float size = uSize * uPixelRatio * (300.0 / max(-mv.z, 1.0));
    gl_PointSize = clamp(size, uMinPixels * uPixelRatio, uMaxPixels * uPixelRatio);
  }
`;

export const pointFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSoftness;

  void main() {
    vec2 offset = gl_PointCoord - vec2(0.5);
    float d = length(offset) * 2.0;
    if (d > 1.0) discard;

    // uSoftness 0 = hard-edged core, 1 = wide soft halo.
    float falloff = pow(1.0 - d, mix(0.9, 3.2, uSoftness));
    gl_FragColor = vec4(uColor, falloff * uOpacity);
  }
`;
