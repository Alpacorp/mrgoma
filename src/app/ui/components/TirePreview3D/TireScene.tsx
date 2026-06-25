'use client';

import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { TireSizeInput } from './tireGeometry';
import TireMesh from './TireMesh';

interface TireSceneProps {
  size: TireSizeInput;
  reducedMotion: boolean;
}

/**
 * The WebGL canvas. Kept intentionally small and self-contained:
 *  - Studio reflections come from inline Lightformers (no external HDRI/CDN).
 *  - Auto-rotation is disabled under reduced motion; the user can still drag.
 *  - Imported only via next/dynamic({ ssr:false }) so three.js never ships in
 *    the main/server bundle.
 */
const TireScene = ({ size, reducedMotion }: TireSceneProps) => {
  return (
    <Canvas
      camera={{ position: [2.6, 1.35, 3.4], fov: 32 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reducedMotion ? 'demand' : 'always'}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} />

      <TireMesh size={size} spin={!reducedMotion} />

      <ContactShadows position={[0, -1.02, 0]} opacity={0.45} scale={4} blur={2.6} far={2} />

      {/* Inline studio environment for PBR reflections on the rim — no asset files. */}
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[2, 3, 2]}
          scale={[4, 4, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-3, 1, -2]}
          scale={[3, 3, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer form="ring" intensity={1} position={[0, -2, 2]} scale={[3, 3, 1]} />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
        autoRotate={false}
      />
    </Canvas>
  );
};

export default TireScene;
