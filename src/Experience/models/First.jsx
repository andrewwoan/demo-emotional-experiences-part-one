import React, { useMemo, useRef, useState, useEffect } from "react";
import { useGLTF, Trail } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { convertMaterialsToBasic } from "../utils/convertToBasic";
import { ConditionalMesh } from "../utils/conditionalMesh";
import { getTextures, initTextureCache } from "../utils/textureCache";

export default function Model({
  progress,
  loopCounter,
  animationTime,
  ...props
}) {
  const { gl } = useThree();
  const planeGroupRef = useRef();
  const [isSnowmanHovered, setIsSnowmanHovered] = useState(false);
  const [hoverTransition, setHoverTransition] = useState(0); // 0 = not hovered, 1 = fully hovered
  const { nodes, materials } = useGLTFWithKTX2("/models/First_New-v1.glb");
  const newmaterials = convertMaterialsToBasic(materials);

  // Smooth transition effect for hover state
  useEffect(() => {
    const transitionSpeed = 0.05; // How fast the transition happens (0.05 = slow, 0.2 = fast)

    const interval = setInterval(() => {
      setHoverTransition((current) => {
        if (isSnowmanHovered) {
          // Transition to hovered state
          return Math.min(1, current + transitionSpeed);
        } else {
          // Transition back to normal state
          return Math.max(0, current - transitionSpeed);
        }
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isSnowmanHovered]);

  // Initialize texture cache once
  useMemo(() => {
    initTextureCache(gl);
  }, [gl]);

  // Get cached textures
  const textures = getTextures();

  // Create the new curve from your points
  const planeCurve = useMemo(() => {
    const curvePoints = [
      new THREE.Vector3(65.778595, 23, -60.343586),
      new THREE.Vector3(52.3722, 22, -67.299667),
      new THREE.Vector3(37.105019, 23, -66.278603),
      new THREE.Vector3(25.075193, 24, -57.861958),
      new THREE.Vector3(20.307816, 23, -44.189159),
      new THREE.Vector3(23.570658, 23, -30.117535),
      new THREE.Vector3(33.883858, 23, -20.324093),
      new THREE.Vector3(48.642017, 22, -17.761627),
      new THREE.Vector3(63.402596, 23, -22.697489),
      new THREE.Vector3(71.929436, 24, -34.287106),
      new THREE.Vector3(72.802902, 25, -48.281929),
    ];

    // Create a smooth catmull-rom curve through the points
    return new THREE.CatmullRomCurve3(curvePoints, true); // true for closed loop
  }, []);

  // Create materials based on loopCounter
  const webpMaterials = useMemo(() => {
    if (loopCounter % 2 === 0) {
      return {
        "third_texutre_set_Baked.001": new THREE.MeshBasicMaterial({
          map: textures.third_night_webp,
        }),
        "second_texutre_set_Baked.001": new THREE.MeshBasicMaterial({
          map: textures.second_night_webp,
        }),
        first_texture_set_baked: new THREE.MeshBasicMaterial({
          map: textures.first_night_webp,
        }),
        "fourth_texture_set_Baked.001": (() => {
          const material = newmaterials["fourth_texture_set_Baked.001"].clone();
          if (material.map) material.map.flipY = false;
          return material;
        })(),
      };
    }
    const clonedMaterials = {};
    Object.keys(newmaterials).forEach((key) => {
      clonedMaterials[key] = newmaterials[key].clone();
      if (clonedMaterials[key].map) {
        clonedMaterials[key].map.flipY = false;
      }
    });
    return clonedMaterials;
  }, [loopCounter, newmaterials, textures]);

  // Door animation configuration
  const doorConfig = {
    door1: { start: 0.55, end: 0.61 },
    door2: { start: 0.64, end: 0.655 },
    maxRotation: Math.PI / 2,
  };

  // Helper function to calculate rotation amount for any door
  const calculateDoorRotation = (doorSettings) => {
    if (progress < doorSettings.start) return 0;
    if (progress > doorSettings.end) return doorConfig.maxRotation;

    const normalizedProgress =
      (progress - doorSettings.start) / (doorSettings.end - doorSettings.start);
    return normalizedProgress * doorConfig.maxRotation;
  };

  // Calculate door rotations
  const door1RotationAmount = useMemo(
    () => calculateDoorRotation(doorConfig.door1),
    [progress]
  );
  const door2RotationAmount = useMemo(
    () => calculateDoorRotation(doorConfig.door2),
    [progress]
  );

  // Calculate final rotations for each door
  const door1Rotation = useMemo(() => {
    const baseRotation = [0, 0.135, 0];
    return [
      baseRotation[0],
      baseRotation[1] + door1RotationAmount,
      baseRotation[2],
    ];
  }, [door1RotationAmount]);

  const door2Rotation = useMemo(() => {
    const baseRotation = [Math.PI, -0.135, 0];
    return [
      baseRotation[0],
      baseRotation[1] - door2RotationAmount,
      baseRotation[2],
    ];
  }, [door2RotationAmount]);

  // Calculate plane group position and rotation based on animationTime
  const planeProgress = useMemo(() => {
    // Map animationTime to [0, 1] for one loop
    const loopDuration = 12; // Seconds for one complete loop
    return (animationTime % loopDuration) / loopDuration;
  }, [animationTime]);

  const planePosition = useMemo(() => {
    return planeCurve.getPoint(planeProgress);
  }, [planeProgress, planeCurve]);

  const planeRotation = useMemo(() => {
    // Get current position and look-ahead position for direction
    const currentT = planeProgress;
    const lookAheadT = (planeProgress + 0.01) % 1; // Small step ahead
    const lookBehindT = (planeProgress - 0.01 + 1) % 1; // Small step behind

    const currentPoint = planeCurve.getPoint(currentT);
    const lookAheadPoint = planeCurve.getPoint(lookAheadT);
    const lookBehindPoint = planeCurve.getPoint(lookBehindT);

    // Calculate direction vector (look at next point)
    const direction = lookAheadPoint.clone().sub(currentPoint).normalize();

    // Calculate curvature for banking
    const prevDirection = currentPoint.clone().sub(lookBehindPoint).normalize();
    const nextDirection = lookAheadPoint.clone().sub(currentPoint).normalize();

    // Calculate the change in direction (curvature)
    const deltaDirection = nextDirection.clone().sub(prevDirection);

    // Calculate banking angle based on curvature
    // We'll use the horizontal component of the direction change
    const bankingIntensity = 0.8; // Adjust this value (0.5-1.5) to control how much the plane banks
    const maxBankAngle = Math.PI / 6; // Maximum 30 degrees of bank

    // Get the cross product to determine left/right turn
    const crossProduct = prevDirection.clone().cross(nextDirection);
    const turnDirection = crossProduct.y > 0 ? -1 : 1; // Flip the direction

    // Calculate bank angle based on curvature magnitude
    const curvatureMagnitude = Math.min(deltaDirection.length() * 50, 1); // Scale and clamp
    const bankAngle =
      turnDirection * curvatureMagnitude * maxBankAngle * bankingIntensity;

    // Create rotation matrix to look in the direction of travel
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, direction).normalize();
    const adjustedUp = new THREE.Vector3()
      .crossVectors(direction, right)
      .normalize();

    // Create the base rotation matrix
    const matrix = new THREE.Matrix4().makeBasis(right, adjustedUp, direction);
    const baseQuaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);

    // Apply banking rotation around the forward axis (Z-axis in local space)
    const bankQuaternion = new THREE.Quaternion().setFromAxisAngle(
      direction,
      bankAngle
    );

    // Combine the rotations: base rotation first, then banking
    const finalQuaternion = bankQuaternion.multiply(baseQuaternion);

    return finalQuaternion;
  }, [planeProgress, planeCurve]);

  // Calculate rotor Z rotation based on animationTime
  const rotorZRotation = useMemo(() => {
    const rotationSpeed = 3; // Rotations per second (adjust for faster/slower spinning)
    return (animationTime * rotationSpeed * Math.PI * 2) % (Math.PI * 2);
  }, [animationTime]);

  // Calculate snowman rocking rotation when hovered
  const snowmanRotation = useMemo(() => {
    const baseRotation = [-2.985, 0.885, 3.034];

    if (hoverTransition === 0) {
      return baseRotation;
    }

    // Create a cute rocking motion using sine wave
    const rockingSpeed = 4; // How fast it rocks (higher = faster)
    const rockingAngle = 0.15; // Maximum rocking angle in radians (about 8.5 degrees)

    // Use animationTime to create smooth sine wave motion
    const rockingOffset =
      Math.sin(animationTime * rockingSpeed) * rockingAngle * hoverTransition;

    // Apply rocking to the Z-axis for left-right motion
    return [baseRotation[0], baseRotation[1], baseRotation[2] + rockingOffset];
  }, [hoverTransition, animationTime]);

  return (
    <group {...props} dispose={null}>
      {/* Plane Group with Dual Trails - only show when loopCounter is odd */}
      {loopCounter % 2 !== 0 && (
        <group position={planePosition} quaternion={planeRotation}>
          {/* Left wingtip trail */}
          <Trail
            width={4}
            length={15}
            color="#ffffff" // Sky blue
            attenuation={(width) => width}
            decay={1}
            local={false}
            stride={0}
            interval={1}
          >
            <mesh position={[-3, 0.48, 1]}>
              {" "}
              {/* Adjust these coordinates for left wingtip */}
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </Trail>

          {/* Right wingtip trail */}
          <Trail
            width={4}
            length={15}
            color="#ffffff" // Sky blue
            attenuation={(width) => width}
            decay={1}
            local={false}
            stride={0}
            interval={1}
          >
            <mesh position={[3, 0.48, 1]}>
              {" "}
              {/* Adjust these coordinates for right wingtip */}
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </Trail>

          {/* Main plane group (without trail wrapping) */}
          <group ref={planeGroupRef}>
            <group rotation={[0, Math.PI, -Math.PI / 2]}>
              <mesh
                geometry={nodes.Cessna_plane_Baked.geometry}
                material={webpMaterials["fourth_texture_set_Baked.001"]}
              />
              <mesh
                geometry={nodes.Rotar_Baked.geometry}
                material={webpMaterials["fourth_texture_set_Baked.001"]}
                position={[0, 0, -2.8]}
                rotation={[0, 0, rotorZRotation]}
              />
            </group>
          </group>
        </group>
      )}

      <mesh
        geometry={nodes.Door.geometry}
        material={webpMaterials["third_texutre_set_Baked.001"]}
        position={[4.978, 0.927, -16.477]}
        rotation={door1Rotation}
      />
      <mesh
        geometry={nodes.Door_Two.geometry}
        material={webpMaterials["third_texutre_set_Baked.001"]}
        position={[3.821, 0.875, -18.43]}
        rotation={door2Rotation}
        scale={[-1.004, -1.012, -1.004]}
      />
      <ConditionalMesh progress={progress} showRange={[0.3, 0.64]}>
        <mesh
          geometry={nodes.First_Trees_Baked.geometry}
          material={webpMaterials.first_texture_set_baked}
          position={[29.8, -0.228, -13.801]}
          rotation={[-2.985, 0.885, 3.034]}
        />
      </ConditionalMesh>
      {loopCounter % 2 !== 0 && (
        <mesh
          geometry={nodes.Fourth_Snowman_Baked.geometry}
          material={webpMaterials["fourth_texture_set_Baked.001"]}
          position={[10.701, 0.089, -12.996]}
          rotation={snowmanRotation}
          onPointerEnter={() => setIsSnowmanHovered(true)}
          onPointerLeave={() => setIsSnowmanHovered(false)}
          style={{ cursor: "pointer" }}
        />
      )}
      <mesh
        geometry={nodes.House_Baked.geometry}
        material={webpMaterials["third_texutre_set_Baked.001"]}
        position={[4.432, 3.777, -17.151]}
        rotation={[Math.PI / 2, 0, -0.135]}
      />
      {loopCounter % 2 !== 0 && (
        <mesh
          geometry={nodes.Remove_This_Hidden.geometry}
          material={webpMaterials["third_texutre_set_Baked.001"]}
          position={[4.432, 3.777, -17.151]}
          rotation={[Math.PI / 2, 0, -0.135]}
        />
      )}
      <ConditionalMesh progress={progress} showRange={[0.3, 0.64]}>
        <mesh
          geometry={nodes.Snow_Background_Baked.geometry}
          material={webpMaterials["second_texutre_set_Baked.001"]}
          position={[83.978, -1.359, 4.807]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </ConditionalMesh>
      {loopCounter % 2 !== 0 && (
        <mesh
          geometry={nodes.Other_Hidden.geometry}
          material={webpMaterials["third_texutre_set_Baked.001"]}
          position={[4.432, 3.777, -17.151]}
          rotation={[Math.PI / 2, 0, -0.135]}
        />
      )}
    </group>
  );
}
