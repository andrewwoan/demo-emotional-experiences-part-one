import React from "react";
import { useGLTF } from "@react-three/drei";

import { convertMaterialsToBasic } from "../utils/convertToBasic";
import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { ConditionalMesh } from "../utils/conditionalMesh";

export default function Model({
  progress,
  loopCounter,
  animationTime,
  ...props
}) {
  const { nodes, materials } = useGLTFWithKTX2("/models/Fourth_New-v4.glb");
  const baseMaterials = convertMaterialsToBasic(materials);

  // Determine if we should show nighttime materials
  // Switch to night materials when we're close to completing a loop that will transition to night
  const nightTransitionThreshold = 0.93; // Adjust this value to switch earlier/later

  const isNighttime = (() => {
    // If we're near the end of the current loop, check what the NEXT loop will be
    if (progress >= nightTransitionThreshold) {
      const nextLoopCounter = loopCounter + 1;
      return nextLoopCounter % 2 === 0; // Next loop will be night (even)
    }
    // Otherwise, use current loop counter
    return loopCounter % 2 === 0; // Current loop is night (even)
  })();

  const nightMultiplier = 0.15; // Adjust this value to make it darker/lighter

  const newmaterials = {};

  Object.keys(baseMaterials).forEach((key) => {
    const material = baseMaterials[key].clone();

    if (isNighttime) {
      // Darken the material for nighttime
      if (material.color) {
        material.color.multiplyScalar(nightMultiplier);
      }
      if (material.emissive) {
        material.emissive.multiplyScalar(nightMultiplier);
      }
      // You could also adjust other properties like:
      // material.opacity *= 0.8; // Make slightly more transparent
      // material.roughness *= 1.2; // Make slightly rougher
    }

    newmaterials[key] = material;
  });

  // Calculate rotation for Fourth_Text_Rotation based on loop counter
  const shouldRotate = loopCounter % 2 === 1; // Rotate on odd loops, don't rotate on even loops
  const rotationZ = shouldRotate ? animationTime * 3 : 0;

  return (
    <group {...props} dispose={null}>
      <ConditionalMesh
        progress={progress}
        showRanges={[
          [0, 0.455], // First range: 0 to 0.455
          [0.84, 1], // Second range: 0.95 to 1
        ]}
      >
        <mesh
          geometry={nodes.Fourth_Floor_Baked.geometry}
          material={newmaterials.floor_Baked}
          position={[-6.613, -1.091, -32.441]}
        />
        <mesh
          geometry={nodes.Fourth_Text_Baked.geometry}
          material={newmaterials.fourth_extras_Baked}
          position={[-24.671, -0.425, -35.063]}
          rotation={[Math.PI, -0.365, Math.PI]}
        />
        <mesh
          geometry={nodes.Fourth_Text_Rotation.geometry}
          material={newmaterials.fourth_extras_Baked}
          position={[-25.073, 2.285, -35.333]}
          rotation={[Math.PI, -0.972, Math.PI + rotationZ]}
        />
        <mesh
          geometry={nodes.Rails.geometry}
          material={newmaterials.rails_Baked}
          position={[-6.432, -1.407, 3.62]}
        />
        <mesh
          geometry={nodes.Fourth_Wall_Baked.geometry}
          material={newmaterials.wall_Baked}
          position={[-19.505, -2.498, -75.294]}
          rotation={[Math.PI / 2, 0, 3.003]}
        />
      </ConditionalMesh>
      <ConditionalMesh
        progress={progress}
        showRanges={[
          [0, 0.3], // First range: 0 to 0.455
          [0.84, 1], // Second range: 0.95 to 1
        ]}
      >
        <mesh
          geometry={nodes.Hide_This001.geometry}
          material={newmaterials.wall_Baked}
          position={[-19.505, -2.498, -75.294]}
          rotation={[Math.PI / 2, 0, 3.003]}
        />
      </ConditionalMesh>
    </group>
  );
}
