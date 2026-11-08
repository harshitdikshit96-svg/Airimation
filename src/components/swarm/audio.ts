// Show audio, synthesised with the Web Audio API. No audio files at all,
// so the sound costs nothing to download (the brief's budget was 500 KB).
//
//   bed      a warm, slowly breathing pad (detuned sine pair through a
//            low-pass) plus soft wind (filtered noise)
//   crickets sparse, randomised high chirps: a night outdoors
//   whoosh   a band-passed noise sweep, played on each formation change
//
// Muted on load, always. The AudioContext is only created inside the click
// that unmutes it, which is also what browsers require to allow sound.

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  noise: AudioBuffer;
  cricketTimer: number;
};

let engine: Engine | null = null;
let muted = true;
const listeners = new Set<() => void>();

function makeNoise(ctx: AudioContext, seconds = 2): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function startBed(e: Engine) {
  const { ctx, master, noise } = e;

  // Pad: A2 + E3, gently detuned, breathing via a slow LFO on the filter.
  const pad = ctx.createGain();
  pad.gain.value = 0.05;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 520;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 220;
  lfo.connect(lfoDepth).connect(lowpass.frequency);
  lfo.start();
  for (const [freq, detune] of [[110, -6], [110, 7], [164.81, -4], [164.81, 5]]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(lowpass);
    osc.start();
  }
  lowpass.connect(pad).connect(master);

  // Wind.
  const wind = ctx.createBufferSource();
  wind.buffer = noise;
  wind.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 420;
  windFilter.Q.value = 0.6;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.018;
  wind.connect(windFilter).connect(windGain).connect(master);
  wind.start();

  // Crickets, every few seconds, never in rhythm.
  const chirp = () => {
    if (!engine) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.frequency.value = 4200 + Math.random() * 900;
    const g = ctx.createGain();
    g.gain.value = 0;
    osc.connect(g).connect(master);
    for (let k = 0; k < 3; k++) {
      const s = t + k * 0.07;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.008, s + 0.012);
      g.gain.linearRampToValueAtTime(0, s + 0.045);
    }
    osc.start(t);
    osc.stop(t + 0.3);
    e.cricketTimer = window.setTimeout(chirp, 1800 + Math.random() * 4200);
  };
  e.cricketTimer = window.setTimeout(chirp, 1200);
}

function emit() {
  listeners.forEach((l) => l());
}

export function isMuted() {
  return muted;
}

export function subscribeAudio(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Call from a click handler only. */
export function setMuted(next: boolean) {
  muted = next;
  if (!next && !engine) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    engine = { ctx, master, noise: makeNoise(ctx), cricketTimer: 0 };
    startBed(engine);
  }
  if (engine) {
    const { ctx, master } = engine;
    if (!next) void ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.4);
  }
  emit();
}

/** Soft air movement as the swarm reforms. Silent while muted. */
export function whoosh(intensity = 1) {
  if (muted || !engine) return;
  const { ctx, master, noise } = engine;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(260, t);
  filter.frequency.exponentialRampToValueAtTime(1500, t + 1.1);
  filter.frequency.exponentialRampToValueAtTime(380, t + 2.6);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09 * intensity, t + 0.9);
  g.gain.linearRampToValueAtTime(0, t + 2.6);
  src.connect(filter).connect(g).connect(master);
  src.start(t, Math.random());
  src.stop(t + 2.7);
}

export function disposeAudio() {
  if (!engine) return;
  window.clearTimeout(engine.cricketTimer);
  void engine.ctx.close();
  engine = null;
  muted = true;
  emit();
}
