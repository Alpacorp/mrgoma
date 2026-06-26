'use client';

import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { TireSizeInput } from './tireGeometry';
import TireMesh from './TireMesh';
import { useCanvasActive } from './useCanvasActive';

interface TireSceneProps {
  size: TireSizeInput;
  reducedMotion: boolean;
}

/**
 * The WebGL canvas. Kept small and self-contained:
 *  - Studio reflections come from inline Lightformers (no external HDRI/CDN).
 *  - ACES tone mapping + a key/fill/rim rig give the rubber and rim depth.
 *  - Auto-rotation is disabled under reduced motion; the user can still drag.
 *  - Imported only via next/dynamic({ ssr:false }) so three.js never ships in
 *    the main/server bundle.
 */
const TireScene = ({ size, reducedMotion }: TireSceneProps) => {
  const { ref, active } = useCanvasActive();
  return (
    <div ref={ref} className="h-full w-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [2.6, 1.35, 3.4], fov: 32 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
      >
      <ambientLight intensity={0.6} />
      {/* Key */}
      <directionalLight position={[4, 6, 5]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} />
      {/* Side fill */}
      <directionalLight position={[-5, 1, 2]} intensity={0.8} />
      {/* Front fill so the face never falls into shadow on dim screens */}
      <directionalLight position={[0, 1.5, 6]} intensity={1} />
      {/* Cool rim light (back-left) to separate the tire edge from the background */}
      <directionalLight position={[-3, 3, -6]} intensity={2} color="#eaf0ff" />
      {/* Warm rim light (back-right) for a second edge highlight */}
      <directionalLight position={[5, 2, -4]} intensity={1.3} color="#fff2e0" />

      <TireMesh size={size} spin={!reducedMotion} />

      <ContactShadows position={[0, -1.02, 0]} opacity={0.5} scale={4.5} blur={2.8} far={2} />

      {/* Inline studio environment for PBR reflections — no asset files. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[2, 3, 3]} scale={[6, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.2} position={[-4, 1, 2]} scale={[4, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3} position={[-2, 2, -5]} scale={[5, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.8} position={[0, -3, 3]} scale={[4, 4, 1]} />
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
    </div>
  );
};

export default TireScene;
