import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Scene from "./Scene";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import normalizeWheel from "normalize-wheel";

const Experience = ({ soundEnabled = false }) => {
  const camera = useRef();
  const cameraGroup = useRef();
  const [scrollProgress, setscrollProgress] = useState(0);
  const targetScrollProgress = useRef(0);
  const scrollSpeed = 0.005;
  const lerpFactor = 0.1;
  const isSwiping = useRef(false);
  const mousePositionOffset = useRef(new THREE.Vector3());
  const mouseRotationOffset = useRef(new THREE.Euler());
  const lastTouchY = useRef(null);

  const showInfoModal = false;

  useEffect(() => {
    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Only run animation if NOT on iOS
    if (!isIOS) {
      const tl = gsap.timeline();

      tl.to(targetScrollProgress, {
        current: 1.01,
        duration: 2,
        ease: "none",
      }).to(targetScrollProgress, {
        current: 1.01,
        duration: 2,
        delay: 1,
        ease: "none",
      });

      return () => {
        tl.kill();
      };
    }
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      const normalized = normalizeWheel(e);

      targetScrollProgress.current +=
        Math.sign(normalized.pixelY) *
        scrollSpeed *
        Math.min(Math.abs(normalized.pixelY) / 100, 1);
    };

    const handleMouseMove = (e) => {
      if (showInfoModal) return;

      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (e.clientY / window.innerHeight) * 2 - 1;

      const sensitivityX = 0.05;
      const sensitivityY = 0.05;

      mousePositionOffset.current.x = mouseX * sensitivityX;
      mousePositionOffset.current.y = mouseY * sensitivityY;

      const rotationSensitivityX = 0.05;
      const rotationSensitivityY = 0.05;

      mouseRotationOffset.current.x = mouseY * rotationSensitivityX;
      mouseRotationOffset.current.y = mouseX * rotationSensitivityY;
    };

    const handleTouchStart = (e) => {
      isSwiping.current = true;
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping.current) return;

      if (lastTouchY.current !== null) {
        const deltaY = e.touches[0].clientY - lastTouchY.current;
        const touchMultiplier = 0.3;
        targetScrollProgress.current +=
          Math.sign(deltaY) * scrollSpeed * touchMultiplier;
      }
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      isSwiping.current = false;
      lastTouchY.current = null;
    };

    const handleMouseDown = (e) => {
      if (e.pointerType === "touch") return;
      isSwiping.current = true;
    };

    const handleMouseDrag = (e) => {
      if (!isSwiping.current || e.pointerType === "touch" || showInfoModal)
        return;
      const mouseMultiplier = 0.2;
      targetScrollProgress.current +=
        Math.sign(e.movementY) * scrollSpeed * mouseMultiplier;
    };

    const handleMouseUp = () => {
      isSwiping.current = false;
    };

    // Handle ESC key to close info modal
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showInfoModal) {
        setShowInfoModal(false);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleMouseDrag);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseDrag);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <Canvas flat={true} eventSource={document.getElementById("root")}>
        <group ref={cameraGroup}>
          <PerspectiveCamera
            ref={camera}
            fov={45}
            makeDefault
            position={[0, 10, 0]}
          />
        </group>
        {/* <OrbitControls enableZoom={false} /> */}
        <Scene
          cameraGroup={cameraGroup}
          camera={camera}
          scrollProgress={scrollProgress}
          setscrollProgress={setscrollProgress}
          targetScrollProgress={targetScrollProgress}
          lerpFactor={lerpFactor}
          mousePositionOffset={mousePositionOffset}
          mouseRotationOffset={mouseRotationOffset}
          soundEnabled={soundEnabled}
        />
      </Canvas>
    </>
  );
};

export default Experience;
