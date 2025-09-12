import { React, Suspense, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Howl } from "howler";

import First from "./models/First";
import Second from "./models/Second";
import Third from "./models/Third";
import Fourth from "./models/Fourth";

import {
  cameraCurve,
  DebugCurve,
  rotationTargets,
  CameraHelper,
} from "./utils/curve";

// Define audio configurations for each progress range
const audioConfigs = {
  ALLIWANTISYOUUUU: {
    start: 0.445,
    end: 0.624,
    src: "/music/ALLIWANTISYOUUUU.mp3",
    volume: 0.3,
    loop: true,
    fadeDuration: 1000,
  },
  Sushi: {
    start: 0.624,
    end: 0.8,
    src: "/music/sushi.mp3",
    volume: 0.3,
    loop: true,
    fadeDuration: 1000,
  },
  Pirates: {
    start: 0.8,
    end: 0.99,
    src: "/music/pirates.mp3",
    volume: 0.3,
    loop: true,
    fadeDuration: 1000,
  },
};

const Scene = ({
  cameraGroup,
  camera,
  scrollProgress,
  setscrollProgress,
  targetScrollProgress,
  lerpFactor,
  mousePositionOffset,
  mouseRotationOffset,
  soundEnabled = false, // Default to true, assuming audio is enabled
  hasEntered = false, // Add this prop
}) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [rotationBufferQuat] = useState(
    new THREE.Quaternion().setFromEuler(rotationTargets[0].rotation)
  );
  const [loopCounter, setLoopCounter] = useState(1);
  const [currentCubemapFolder, setCurrentCubemapFolder] = useState("day");

  // Three.js scene reference
  const { scene } = useThree();
  const [preloadedTextures, setPreloadedTextures] = useState({});
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  // Audio system state
  const [audioTracks, setAudioTracks] = useState({});
  const [currentAudioTrack, setCurrentAudioTrack] = useState(null);
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const previousAudioKeyRef = useRef(null);

  // Simple animation time for plane
  const animationTime = useRef(0);

  // Initialize audio tracks
  useEffect(() => {
    if (!soundEnabled) {
      setTracksLoaded(true);
      return;
    }

    const tracks = {};
    const loadPromises = [];

    Object.entries(audioConfigs).forEach(([key, config]) => {
      const promise = new Promise((resolve) => {
        tracks[key] = new Howl({
          src: [config.src],
          volume: 0, // Start with 0 volume for smooth fading
          loop: config.loop,
          preload: true,
          onload: () => {
            resolve();
          },
          onloaderror: (id, error) => {
            console.error(`Error loading audio for ${key}:`, error);
            resolve(); // Resolve anyway to not block loading
          },
        });
      });
      loadPromises.push(promise);
    });

    Promise.all(loadPromises).then(() => {
      setAudioTracks(tracks);
      setTracksLoaded(true);
    });

    // Cleanup function
    return () => {
      Object.values(tracks).forEach((track) => {
        if (track) {
          track.stop();
          track.unload();
        }
      });
    };
  }, [soundEnabled]);

  // Function to get the current audio key based on scroll progress
  const getCurrentAudioKey = (progress) => {
    // Disable audio on even loop counts
    if (loopCounter % 2 === 0) {
      return null;
    }
    for (const [key, config] of Object.entries(audioConfigs)) {
      if (progress >= config.start && progress <= config.end) {
        return key;
      }
    }
    return null;
  };

  // Function to switch audio tracks with crossfade
  const switchAudioTrack = (fromTrack, toTrack, audioKey) => {
    const config = audioConfigs[audioKey];
    const fadeDuration = config?.fadeDuration || 500;

    if (fromTrack && fromTrack.playing()) {
      fromTrack.fade(fromTrack.volume(), 0, fadeDuration);
      fromTrack.once("fade", () => {
        fromTrack.stop();
      });
    }

    if (toTrack) {
      toTrack.volume(0); // Ensure volume starts at 0
      toTrack.play();
      toTrack.fade(0, config.volume, fadeDuration); // Fade in to target volume
      setCurrentAudioTrack(toTrack);
    }
  };

  // Handle audio transitions based on scroll progress
  useEffect(() => {
    if (!tracksLoaded || !soundEnabled) return;

    const currentAudioKey = getCurrentAudioKey(scrollProgress);

    // If no audio is active (e.g., even loop, progress < 0.32 or > 0.99), stop audio
    if (!currentAudioKey) {
      if (currentAudioTrack && currentAudioTrack.playing()) {
        currentAudioTrack.fade(currentAudioTrack.volume(), 0, 500);
        currentAudioTrack.once("fade", () => {
          currentAudioTrack.stop();
        });
        setCurrentAudioTrack(null);
      }
      previousAudioKeyRef.current = null;
      return;
    }

    // Check if we need to switch tracks (audio key changed)
    if (previousAudioKeyRef.current !== currentAudioKey) {
      const targetTrack = audioTracks[currentAudioKey];
      if (targetTrack && targetTrack !== currentAudioTrack) {
        switchAudioTrack(currentAudioTrack, targetTrack, currentAudioKey);
      }
      previousAudioKeyRef.current = currentAudioKey;
    }

    // Handle case where we're in an audio range but no track is playing
    if (
      currentAudioKey &&
      (!currentAudioTrack || !currentAudioTrack.playing())
    ) {
      const track = audioTracks[currentAudioKey];
      if (track) {
        track.volume(0); // Ensure volume starts at 0
        track.play();
        track.fade(
          0,
          audioConfigs[currentAudioKey].volume,
          audioConfigs[currentAudioKey].fadeDuration
        ); // Fade in to target volume
        setCurrentAudioTrack(track);
      }
    }
  }, [
    scrollProgress,
    tracksLoaded,
    audioTracks,
    currentAudioTrack,
    soundEnabled,
    loopCounter, // Added to ensure audio reacts to loop changes
  ]);

  // Preload both day and night cubemap textures on component mount
  useEffect(() => {
    const loader = new THREE.CubeTextureLoader();
    const textures = {};
    const loadPromises = [];

    // Define both day and night cubemap configurations
    const cubemapConfigs = {
      day: [
        "/cubemap/day/px.webp",
        "/cubemap/day/nx.webp",
        "/cubemap/day/py.webp",
        "/cubemap/day/ny.webp",
        "/cubemap/day/pz.webp",
        "/cubemap/day/nz.webp",
      ],
      night: [
        "/cubemap/night/px.webp",
        "/cubemap/night/nx.webp",
        "/cubemap/night/py.webp",
        "/cubemap/night/ny.webp",
        "/cubemap/night/pz.webp",
        "/cubemap/night/nz.webp",
      ],
    };

    // Load each cubemap configuration
    Object.entries(cubemapConfigs).forEach(([key, files]) => {
      const promise = new Promise((resolve) => {
        textures[key] = loader.load(
          files,
          (texture) => {
            resolve();
          },
          undefined,
          (error) => {
            console.error(`Error loading ${key} cubemap:`, error);
            resolve();
          }
        );
      });
      loadPromises.push(promise);
    });

    Promise.all(loadPromises).then(() => {
      setPreloadedTextures(textures);
      setTexturesLoaded(true);

      // Set initial background to day
      if (textures.day) {
        scene.background = textures.day;
      }
    });
  }, [scene]);

  // Update scene background when cubemap folder changes
  useEffect(() => {
    if (texturesLoaded && preloadedTextures[currentCubemapFolder]) {
      scene.background = preloadedTextures[currentCubemapFolder];
    }
  }, [currentCubemapFolder, texturesLoaded, preloadedTextures, scene]);

  // Determine cubemap folder based on loop counter
  const getCubemapFolder = (counter) => {
    return counter % 2 === 0 ? "night" : "day";
  };

  const getLerpedRotation = (progress) => {
    for (let i = 0; i < rotationTargets.length - 1; i++) {
      const start = rotationTargets[i];
      const end = rotationTargets[i + 1];
      if (progress >= start.progress && progress <= end.progress) {
        const lerpFactor =
          (progress - start.progress) / (end.progress - start.progress);

        const startQuaternion = new THREE.Quaternion().setFromEuler(
          start.rotation
        );
        const endQuaternion = new THREE.Quaternion().setFromEuler(end.rotation);

        const lerpingQuaternion = new THREE.Quaternion();
        lerpingQuaternion.slerpQuaternions(
          startQuaternion,
          endQuaternion,
          lerpFactor
        );

        return lerpingQuaternion;
      }
    }

    return new THREE.Quaternion().setFromEuler(
      rotationTargets[rotationTargets.length - 1].rotation
    );
  };

  useFrame((state) => {
    if (camera) {
      const newPulseIntensity = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
      setPulseIntensity(newPulseIntensity);

      // Update animation time for plane
      animationTime.current = state.clock.elapsedTime;

      let newProgress = THREE.MathUtils.lerp(
        scrollProgress,
        targetScrollProgress.current,
        lerpFactor
      );

      console.log(targetScrollProgress);

      if (newProgress >= 1) {
        newProgress = 0;
        targetScrollProgress.current = 0;
        const newLoopCounter = loopCounter + 1;
        setLoopCounter(newLoopCounter);
        const newFolder = getCubemapFolder(newLoopCounter);
        if (newFolder !== currentCubemapFolder) {
          setCurrentCubemapFolder(newFolder);
        }
        console.log(`Entering loop ${newLoopCounter}`);
      } else if (newProgress < 0) {
        newProgress = 1;
        targetScrollProgress.current = 1;
        const newLoopCounter = loopCounter - 1;
        setLoopCounter(newLoopCounter);
        const newFolder = getCubemapFolder(newLoopCounter);
        if (newFolder !== currentCubemapFolder) {
          setCurrentCubemapFolder(newFolder);
        }
        console.log(`Entering loop ${newLoopCounter}`);
      }

      setscrollProgress(newProgress);

      const basePoint = cameraCurve.getPoint(newProgress);

      cameraGroup.current.position.x = THREE.MathUtils.lerp(
        cameraGroup.current.position.x,
        basePoint.x,
        0.1
      );
      cameraGroup.current.position.y = THREE.MathUtils.lerp(
        cameraGroup.current.position.y,
        basePoint.y,
        0.1
      );
      cameraGroup.current.position.z = THREE.MathUtils.lerp(
        cameraGroup.current.position.z,
        basePoint.z,
        0.1
      );

      camera.current.position.x = THREE.MathUtils.lerp(
        camera.current.position.x,
        mousePositionOffset.current.x,
        0.1
      );
      camera.current.position.y = THREE.MathUtils.lerp(
        camera.current.position.y,
        -mousePositionOffset.current.y,
        0.1
      );
      camera.current.position.z = 0;

      const targetRotation = getLerpedRotation(newProgress);
      rotationBufferQuat.slerp(targetRotation, 0.05);
      cameraGroup.current.quaternion.copy(rotationBufferQuat);

      camera.current.rotation.x = THREE.MathUtils.lerp(
        camera.current.rotation.x,
        -mouseRotationOffset.current.x,
        0.1
      );
      camera.current.rotation.y = THREE.MathUtils.lerp(
        camera.current.rotation.y,
        -mouseRotationOffset.current.y,
        0.1
      );
    }
  });

  return (
    <>
      {/* Only render Environment for lighting, not background */}
      <Environment
        background={false}
        backgroundRotation={[0, Math.PI / 2, 0]}
        files={[
          "/cubemap/day/px.webp",
          "/cubemap/day/nx.webp",
          "/cubemap/day/py.webp",
          "/cubemap/day/ny.webp",
          "/cubemap/day/pz.webp",
          "/cubemap/day/nz.webp",
        ]}
      />

      <Suspense fallback={null}>
        <First
          progress={scrollProgress}
          loopCounter={loopCounter}
          animationTime={animationTime.current}
        />
        <Second progress={scrollProgress} loopCounter={loopCounter} />
        <Third
          progress={scrollProgress}
          loopCounter={loopCounter}
          animationTime={animationTime.current}
        />
        <Fourth
          progress={scrollProgress}
          loopCounter={loopCounter}
          animationTime={animationTime.current}
        />
      </Suspense>
    </>
  );
};

export default Scene;
