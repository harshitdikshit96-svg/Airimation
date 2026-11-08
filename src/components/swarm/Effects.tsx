"use client";

import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { HalfFloatType } from "three";
import type { QualityProfile } from "./quality";

/**
 * Bloom -> filmic tone mapping -> vignette -> film grain.
 *
 * The threshold sits at 1.0 in linear HDR. Only the drones' cores (pushed
 * to ~3.4) and the brightest lit windows cross it; the sky tops out around
 * 0.25, so it never washes out. Half-float buffers are what let values
 * above 1 survive until the bloom pass sees them.
 *
 * Grain is barely visible but does real work: it breaks up the last of
 * the gradient banding in the sky and makes the frame read as photographed
 * rather than rendered.
 */
export default function Effects({ quality }: { quality: QualityProfile }) {
  if (!quality.bloom) return null;
  return (
    <EffectComposer multisampling={quality.multisampling} frameBufferType={HalfFloatType}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.9}
        luminanceSmoothing={0.3}
        intensity={quality.tier === "high" ? 1.7 : 1.35}
        radius={0.78}
      />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.22} darkness={0.6} />
      <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
