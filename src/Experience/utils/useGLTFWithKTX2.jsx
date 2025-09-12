// utils/useGLTFWithKTX2.js
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { KTX2Loader } from "three-stdlib";

let sharedKTX2Loader = null;

function getKTX2Loader(gl) {
  if (!sharedKTX2Loader) {
    sharedKTX2Loader = new KTX2Loader();
    sharedKTX2Loader.setTranscoderPath("/basis/");
    sharedKTX2Loader.detectSupport(gl);
  }
  return sharedKTX2Loader;
}

export function useGLTFWithKTX2(path) {
  const { gl } = useThree();
  const ktx2Loader = getKTX2Loader(gl);

  return useGLTF(path, true, true, (loader) => {
    loader.setKTX2Loader(ktx2Loader);
  });
}

// Export the same loader for manual texture loading
export function useKTX2Loader() {
  const { gl } = useThree();
  return getKTX2Loader(gl);
}
