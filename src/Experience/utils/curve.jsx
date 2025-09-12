import * as THREE from "three";

export const cameraCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-1.052099, 0.829584, -50.777229), // Original 11th point (now 1st)
    new THREE.Vector3(-6.579686, 0.829584, -58.459641), // Original 12th point
    new THREE.Vector3(-16.323229, 0.829584, -60.708153), // Original 13th point
    new THREE.Vector3(-25.410957, 0.829584, -59.209145), // Original 14th point
    new THREE.Vector3(-31.208363, 0.829584, -47.842926), // Original 15th point
    new THREE.Vector3(-31.208363, 0.829584, -36.510437), // Original 16th point
    new THREE.Vector3(-29.319614, 0.829584, -22.479734), // Original 17th point
    new THREE.Vector3(-28.24033, 0.829584, -10.607602), // Original 18th point
    new THREE.Vector3(-21.494801, 0.829584, -0.624219), // Original 19th point
    new THREE.Vector3(-10.836866, 0.829584, 1.264529), // Original 20th point
    new THREE.Vector3(-3.173991, 0.527087, -1.304273), // Original 1st point
    new THREE.Vector3(3.737109, 0.527087, -5.512709), // Original 2nd point
    new THREE.Vector3(5.077224, 0.527087, -11.86543), // Original 3rd point
    new THREE.Vector3(4.399514, 1.654118, -17.444349), // Original 4th point
    new THREE.Vector3(3.968427, 1.370732, -22.734327), // Original 5th point
    new THREE.Vector3(4.20915, 1.370732, -22.902386), // Original 6th point
    new THREE.Vector3(4.044714, 0.89, -24.020878), // Original 7th point
    new THREE.Vector3(3.454959, 0.89, -26.829981), // Original 8th point
    new THREE.Vector3(1.747707, 0.89, -33.011375), // Original 9th point
    new THREE.Vector3(0.276049, 0.89, -41.454048), // Original 10th point
  ],
  true
);

export const rotationTargets = [
  {
    progress: 0,
    rotation: new THREE.Euler(
      -0.038597514321675644,
      0.8154055301533364,
      0.02810569163183589
    ),
  },
  {
    progress: 0.055,
    rotation: new THREE.Euler(
      2.2047942930161795,
      1.4880863769407249,
      -2.2064294165723446
    ),
  },
  {
    progress: 0.13,
    rotation: new THREE.Euler(
      3.1256350302022784,
      0.6934794117695023,
      -3.131391760460809
    ),
  },
  {
    progress: 0.185,
    rotation: new THREE.Euler(
      -3.138442697177022,
      0.11420021820989185,
      3.1412337081038175
    ),
  },
  {
    progress: 0.29,
    rotation: new THREE.Euler(
      2.716034560839007,
      0.6125063010299661,
      -2.8866760046635442
    ),
  },
  {
    progress: 0.35,
    rotation: new THREE.Euler(
      2.976724257417679,
      -0.3910832069908284,
      3.07825561005502
    ),
  },
  {
    progress: 0.445,
    rotation: new THREE.Euler(
      0.24981501181729196,
      -1.0564159428880338,
      0.21857968605933972
    ),
  },
  {
    progress: 0.49,
    rotation: new THREE.Euler(
      0.02730549341533425,
      -0.7803355469627675,
      0.019212315528106413
    ),
  },

  {
    progress: 0.5449,
    rotation: new THREE.Euler(
      0.1008607478753292,
      -0.348678967270152,
      0.03456329604717317
    ),
  },
  {
    progress: 0.605,
    rotation: new THREE.Euler(
      0.20214549564319423,
      0.22629958863925614,
      -0.04595168037361695
    ),
  },
  {
    progress: 0.66,
    rotation: new THREE.Euler(
      -0.047367870994332976,
      0.18159072541163052,
      0.008560565370711806
    ),
  },
  {
    progress: 0.725,
    rotation: new THREE.Euler(
      -0.05930000614915086,
      -0.009461218250415347,
      -0.0005617004302795479
    ),
  },
  {
    progress: 0.79,
    rotation: new THREE.Euler(
      -0.23765623993059345,
      0.29510340036685295,
      0.07033483063611501
    ),
  },
  {
    progress: 0.815,
    rotation: new THREE.Euler(
      0.007820434024873394,
      0.21127857159964955,
      -0.0016400568392306517
    ),
  },
  {
    progress: 0.885,
    rotation: new THREE.Euler(
      0.025055694703958784,
      0.010675691104635617,
      -0.0002675377577822383
    ),
  },
  {
    progress: 0.96,
    rotation: new THREE.Euler(
      -0.02578822350411628,
      0.1682548285691379,
      0.004319480209693675
    ),
  },
  {
    progress: 1,
    rotation: new THREE.Euler(
      -0.038597514321675644,
      0.8154055301533364,
      0.02810569163183589
    ),
  },
];

export const DebugCurve = ({ curve }) => {
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={"red"} />
    </line>
  );
};

export const CameraHelper = ({ cameraRef }) => {
  useHelper(cameraRef, THREE.CameraHelper);

  return null;
};
