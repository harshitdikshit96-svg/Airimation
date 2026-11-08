// The drone shader: GPU morphing plus an HDR LED sprite.
//
// The CPU uploads two position buffers (where each drone is coming from,
// where it is going) and two colour buffers ONCE per formation change. From
// then on a single uniform, uProgress, drives the whole transition: the
// shader does the easing, the per-drone stagger, the flight arc, hover
// drift, twinkle and dissolve. Per frame the CPU writes a handful of
// uniforms and nothing else, at any drone count.
//
// Each drone is one point sprite: a very tight, very bright core (values
// well above 1.0, so only drones cross the bloom threshold and the sky
// never washes out) inside a soft halo. With bloom on, the core flares like
// a real LED photographed at night; with bloom off (low tier), the halo is
// widened to fake it.
//
// The same geometry is drawn several times with different uniforms:
//   - trails: uLag > 0 renders the swarm slightly in the past, dimmer
//   - reflection: uMirror = 1 flips it about the water line, rippled

export const droneVertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aColorFrom;
  attribute vec3 aColorTo;
  /** 0..1: when this drone starts moving within the stagger window. */
  attribute float aDelay;
  /** 0..1: stable per-drone random. */
  attribute float aSeed;

  uniform float uProgress;
  uniform float uStagger;
  uniform float uArc;
  uniform float uTime;
  uniform float uHover;
  uniform float uLit;
  uniform float uDissolve;
  uniform float uTwinkle;
  uniform float uMotion;
  uniform float uLag;
  uniform float uMirror;
  uniform float uWaterY;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMinPx;
  uniform float uMaxPx;
  uniform vec3 uCentre;

  varying vec3 vColor;
  varying float vIntensity;

  const float PI = 3.14159265;

  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float progress = clamp(uProgress - uLag, 0.0, 1.0);
    float local = clamp((progress - aDelay * uStagger) / max(1.0 - uStagger, 0.001), 0.0, 1.0);
    float e = easeInOutCubic(local);
    float flight = sin(e * PI);

    vec3 p = mix(aFrom, aTo, e);
    // Arc up and swing slightly sideways mid-flight: paths separate, and
    // the swarm reads as flying rather than sliding.
    p.y += flight * uArc * (0.55 + 0.9 * aSeed);
    p.x += flight * uArc * 0.35 * (aSeed - 0.5);

    // Airborne drones hold position the way real ones do: almost, not quite.
    float airborne = smoothstep(1.0, 8.0, p.y);
    p += vec3(
      sin(uTime * 0.53 + aSeed * 41.0),
      sin(uTime * 0.71 + aSeed * 17.0) * 0.6,
      cos(uTime * 0.47 + aSeed * 23.0)
    ) * uHover * airborne;

    // Dissolve: drift outward and upward from the formation centre.
    vec3 away = p - uCentre;
    float dist = max(length(away), 0.001);
    p += (away / dist) * uDissolve * (18.0 + 40.0 * aSeed);
    p.y += uDissolve * uDissolve * 30.0 * aSeed;

    vColor = mix(aColorFrom, aColorTo, e);

    // Lift-off light wave: each drone switches on as uLit passes its delay.
    float lit = smoothstep(aDelay - 0.06, aDelay + 0.02, uLit * 1.08);
    float twinkle = 1.0 - uTwinkle * (0.5 + 0.5 * sin(uTime * (2.2 + aSeed * 3.1) + aSeed * 63.0));
    float fade = 1.0 - smoothstep(0.35, 1.0, uDissolve);
    vIntensity = mix(0.1, 1.0, lit) * twinkle * fade;

    // A trail only exists while its drone is actually travelling; a ghost
    // sitting on a held drone would just make it look brighter.
    if (uLag > 0.0) vIntensity *= uMotion * smoothstep(0.0, 0.3, flight);

    if (uMirror > 0.5) {
      p.y = uWaterY - (p.y - uWaterY);
      // Ripple: reflections shiver sideways, more the further they fall.
      p.x += sin(uTime * 1.7 + p.y * 0.35 + aSeed * 9.0) * (0.6 + abs(p.y - uWaterY) * 0.02);
      vIntensity *= 0.32;
    }

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * uPixelRatio * (300.0 / max(-mv.z, 1.0));
    gl_PointSize = clamp(size, uMinPx * uPixelRatio, uMaxPx * uPixelRatio);
  }
`;

export const droneFragmentShader = /* glsl */ `
  uniform float uCore;
  uniform float uHalo;
  uniform float uHaloWidth;
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r2 = dot(c, c) * 4.0;
    if (r2 > 1.0) discard;

    // Two gaussians: a hot pinpoint and a soft glow around it. The core is
    // pushed toward white as it saturates, the way an over-exposed LED is.
    float core = exp(-r2 * 26.0);
    float halo = exp(-r2 * uHaloWidth);
    vec3 hot = mix(vColor, vec3(1.0), core * 0.55);
    vec3 col = hot * core * uCore + vColor * halo * uHalo;

    gl_FragColor = vec4(col * vIntensity * uOpacity, 1.0);
    // Tone mapping only runs when drawing straight to the screen (low tier,
    // no composer); with a composer the ToneMapping effect does it.
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
