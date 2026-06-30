'use client';

import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { useCanvasActive } from '../TirePreview3D/useCanvasActive';

const SCALE = 0.08; // world units per 1/32" of tread depth

// Tire-section geometry. The tread is laid on a slice of the tire's
// circumference (radius R, sweeping ARC) so it reads as the curved surface of a
// real tire instead of a flat microscope slab.
const R = 4.0; // tread radius (world units)
const ARC = (76 * Math.PI) / 180; // angular slice of tire shown
const ROWS = 6; // tread segments around the arc (rolling direction)
const COLS = 4; // ribs across the tread width (axial)
const W = 3.3; // tread width (axial, along Z)
const BASE_T = 0.45; // carcass thickness

interface TreadBlocksProps {
  /** Remaining groove depth in 1/32". */
  currentUnits: number;
  /** Original (new-tire) groove depth in 1/32". */
  newUnits: number;
}

/**
 * A slice of the tire read from a clear 3/4 angle. The tread blocks sit on a
 * curved carcass band (a section of the tire's circumference) and rise
 * *radially* — their height IS the remaining tread depth. The worn-away rubber
 * (current → new depth) is a faint green ghost capped by a curved "new level"
 * surface, so you can see at a glance how much tread is left vs a new tire.
 */
const TreadBlocks = ({ currentUnits, newUnits }: TreadBlocksProps) => {
  const h = Math.max(0.05, currentUnits * SCALE);
  const wornH = Math.max(0, (newUnits - currentUnits) * SCALE);
  const newH = newUnits * SCALE;

  const rowAngle = ARC / ROWS;
  // Chord width of one row, with a little overlap so the faceted band looks
  // continuous (no gaps at the segment seams).
  const chordW = 2 * R * Math.sin(rowAngle / 2);
  const blockW = chordW * 0.7; // lateral grooves (around the arc)
  const ribPitch = W / COLS;
  const blockD = ribPitch * 0.72; // longitudinal grooves (across the width)

  const rows = [];
  for (let ri = 0; ri < ROWS; ri++) {
    const theta = -ARC / 2 + (ri + 0.5) * rowAngle;
    const ribs = [];
    for (let ci = 0; ci < COLS; ci++) {
      ribs.push({ key: `${ri}-${ci}`, z: -W / 2 + (ci + 0.5) * ribPitch });
    }
    rows.push({ key: ri, theta, ribs });
  }

  // Offset the whole slice down so the top of the tread sits near the origin and
  // the arc curves away on both sides (nice 3/4 framing).
  return (
    <group position={[0, -(R - 0.2), 0]}>
      {rows.map(row => (
        // Each row is rotated about Z so its local +Y points radially outward.
        <group key={row.key} rotation={[0, 0, row.theta]}>
          {/* Curved carcass band (one facet per row). */}
          <mesh position={[0, R - BASE_T / 2, 0]} receiveShadow>
            <boxGeometry args={[chordW * 1.06, BASE_T, W + 0.2]} />
            <meshStandardMaterial color="#0c0e10" roughness={0.95} />
          </mesh>

          {row.ribs.map(rib => (
            <group key={rib.key}>
              {/* Remaining tread block */}
              <mesh position={[0, R + h / 2, rib.z]} castShadow>
                <boxGeometry args={[blockW, h, blockD]} />
                <meshStandardMaterial color="#1b1e22" roughness={0.85} />
              </mesh>
              {/* Worn-away rubber (ghost) */}
              {wornH > 0.015 && (
                <mesh position={[0, R + h + wornH / 2, rib.z]}>
                  <boxGeometry args={[blockW, wornH, blockD]} />
                  <meshStandardMaterial
                    color="#9dfb40"
                    transparent
                    opacity={0.16}
                    depthWrite={false}
                  />
                </mesh>
              )}
            </group>
          ))}

          {/* New-tire surface level (curved cap, one facet per row). */}
          <mesh position={[0, R + newH, 0]}>
            <boxGeometry args={[chordW * 1.06, 0.014, W + 0.3]} />
            <meshStandardMaterial color="#22c55e" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

interface TreadSceneProps {
  currentUnits: number;
  newUnits: number;
  reducedMotion: boolean;
}

const TreadScene = ({ currentUnits, newUnits, reducedMotion }: TreadSceneProps) => {
  const { ref, active } = useCanvasActive();
  return (
    <div ref={ref} className="h-full w-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [2.9, 2.4, 4.3], fov: 32 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
      >
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 5]} intensity={2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#eaf0ff" />

      <TreadBlocks currentUnits={currentUnits} newUnits={newUnits} />

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.4} position={[3, 4, 3]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-3, 1, 2]} scale={[4, 4, 1]} />
      </Environment>

      <OrbitControls
        makeDefault
        target={[0, 0.35, 0]}
        enablePan={false}
        enableZoom={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
      </Canvas>
    </div>
  );
};

export default TreadScene;
