'use client';

import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { useCanvasActive } from '../TirePreview3D/useCanvasActive';

const SCALE = 0.08; // world units per 1/32" of tread depth

interface TreadBlocksProps {
  /** Remaining groove depth in 1/32". */
  currentUnits: number;
  /** Original (new-tire) groove depth in 1/32". */
  newUnits: number;
}

/**
 * A chunk of tread read from a clear 3/4 angle: wide tread blocks rise out of a
 * carcass base; their height IS the remaining tread depth. The worn-away rubber
 * (current → new depth) is shown as a faint green ghost capped by a "new level"
 * plane, so you can see at a glance how much tread is left vs a new tire.
 */
const TreadBlocks = ({ currentUnits, newUnits }: TreadBlocksProps) => {
  const cols = 4;
  const rows = 2;
  const W = 3.6;
  const D = 2.0;
  const gapX = W / cols;
  const gapZ = D / rows;
  const blockW = gapX * 0.74;
  const blockD = gapZ * 0.74;
  const baseH = 0.5;

  const h = Math.max(0.05, currentUnits * SCALE);
  const wornH = Math.max(0, (newUnits - currentUnits) * SCALE);
  const newH = newUnits * SCALE;

  const blocks = [];
  for (let ci = 0; ci < cols; ci++) {
    for (let ri = 0; ri < rows; ri++) {
      const x = -W / 2 + gapX / 2 + ci * gapX;
      const z = -D / 2 + gapZ / 2 + ri * gapZ;
      blocks.push({ key: `${ci}-${ri}`, x, z });
    }
  }

  return (
    <group position={[0, -0.35, 0]}>
      {/* Carcass base */}
      <mesh position={[0, -baseH / 2, 0]} receiveShadow>
        <boxGeometry args={[W + 0.25, baseH, D + 0.25]} />
        <meshStandardMaterial color="#0c0e10" roughness={0.95} />
      </mesh>

      {blocks.map(b => (
        <group key={b.key} position={[b.x, 0, b.z]}>
          {/* Remaining tread block */}
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[blockW, h, blockD]} />
            <meshStandardMaterial color="#1b1e22" roughness={0.85} />
          </mesh>
          {/* Worn-away rubber (ghost) */}
          {wornH > 0.015 && (
            <mesh position={[0, h + wornH / 2, 0]}>
              <boxGeometry args={[blockW, wornH, blockD]} />
              <meshStandardMaterial color="#9dfb40" transparent opacity={0.16} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}

      {/* New-tire surface level */}
      <mesh position={[0, newH, 0]}>
        <boxGeometry args={[W + 0.3, 0.012, D + 0.3]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.55} />
      </mesh>
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
        camera={{ position: [2.6, 2.7, 3.9], fov: 32 }}
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
