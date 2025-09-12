// Create this file: textureCache.js
import * as THREE from "three";
import { useKTX2Loader } from "../utils/useGLTFWithKTX2";

// Global cache - textures load once and stay in memory
const TEXTURE_CACHE = {};
let ktx2Loader = null;

export const initTextureCache = (gl) => {
  // Use your existing shared KTX2 loader instead of creating a new one
  if (!ktx2Loader) {
    // We'll get the loader when we need it, but store the gl reference
    TEXTURE_CACHE.gl = gl;
  }
};

export const getTextures = (ktx2LoaderFromHook = null) => {
  // Get the KTX2 loader from the hook if provided, or use the cached one
  if (ktx2LoaderFromHook && !ktx2Loader) {
    ktx2Loader = ktx2LoaderFromHook;
  }

  // Load WebP textures if not cached
  if (!TEXTURE_CACHE.webpLoaded) {
    const textureLoader = new THREE.TextureLoader();

    TEXTURE_CACHE.third_night_webp = textureLoader.load(
      "/textures/first/third_night.webp"
    );
    TEXTURE_CACHE.second_night_webp = textureLoader.load(
      "/textures/first/second_night.webp"
    );
    TEXTURE_CACHE.first_night_webp = textureLoader.load(
      "/textures/first/first_night.webp"
    );

    // Set flipY = false
    TEXTURE_CACHE.third_night_webp.flipY = false;
    TEXTURE_CACHE.second_night_webp.flipY = false;
    TEXTURE_CACHE.first_night_webp.flipY = false;

    TEXTURE_CACHE.webpLoaded = true;
  }

  // Load KTX2 textures if not cached and we have a loader
  if (ktx2Loader && !TEXTURE_CACHE.ktx2Loading && !TEXTURE_CACHE.ktx2Loaded) {
    TEXTURE_CACHE.ktx2Loading = true;

    ktx2Loader.load("/textures/third/third_night.ktx2", (texture) => {
      texture.flipY = false;
      TEXTURE_CACHE.third_night_ktx2 = texture;
    });

    ktx2Loader.load("/textures/third/second_night.ktx2", (texture) => {
      texture.flipY = false;
      TEXTURE_CACHE.second_night_ktx2 = texture;
    });

    ktx2Loader.load("/textures/third/first_night.ktx2", (texture) => {
      texture.flipY = false;
      TEXTURE_CACHE.first_night_ktx2 = texture;
      TEXTURE_CACHE.ktx2Loaded = true;
    });
  }

  return TEXTURE_CACHE;
};
