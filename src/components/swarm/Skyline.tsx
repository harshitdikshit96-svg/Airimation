"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const SKYLINE_URL = "/models/skyline.glb";

type Props = {
  /** "ring" circles the launch field (configurator); "ghat" is the riverfront (home). */
  part: "ring" | "ghat";
  position?: [number, number, number];
  /** Brightness of windows and string lights; above 1 so they bloom a little. */
  lightGain?: number;
  /** Mirror the lights below y = 0 for a river reflection. */
  reflect?: boolean;
};

/**
 * The generated skyline (scripts/build-skyline.mjs), Meshopt-compressed.
 *
 * Materials are replaced at load: the GLB carries flat unlit placeholders,
 * and the look — HDR lights that bloom, a silhouette that sinks into the
 * dusk fog — belongs to the renderer, not the asset.
 */
export default function Skyline({ part, position, lightGain = 2.4, reflect = false }: Props) {
  // useGLTF(url, useDraco, useMeshopt)
  const { nodes } = useGLTF(SKYLINE_URL, false, true) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const name = part === "ring" ? "Ring" : "Ghat";
  const silhouette = nodes[`${name}_Silhouette`];
  const lights = nodes[`${name}_Lights`];

  const materials = useMemo(() => {
    const sil = new THREE.MeshBasicMaterial({ color: "#060509", side: THREE.DoubleSide });
    const lit = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      color: new THREE.Color(lightGain, lightGain, lightGain),
    });
    const mirror = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color(lightGain * 0.3, lightGain * 0.3, lightGain * 0.3),
    });
    return { sil, lit, mirror };
  }, [lightGain]);
  useEffect(
    () => () => {
      materials.sil.dispose();
      materials.lit.dispose();
      materials.mirror.dispose();
    },
    [materials]
  );

  if (!silhouette || !lights) return null;

  // Quantized meshes carry their dequantization as a node transform, so the
  // node's position/scale must come along with the geometry.
  const placed = (node: THREE.Mesh, material: THREE.Material, renderOrder = 0) => (
    <mesh
      geometry={node.geometry}
      material={material}
      position={node.position}
      quaternion={node.quaternion}
      scale={node.scale}
      renderOrder={renderOrder}
    />
  );

  return (
    <group position={position}>
      {placed(silhouette, materials.sil)}
      {placed(lights, materials.lit)}
      {reflect && (
        // Water reflections stretch vertically: scale y past -1.
        <group scale={[1, -1.6, 1]}>{placed(lights, materials.mirror, 5)}</group>
      )}
    </group>
  );
}

export function preloadSkyline() {
  useGLTF.preload(SKYLINE_URL, false, true);
}
