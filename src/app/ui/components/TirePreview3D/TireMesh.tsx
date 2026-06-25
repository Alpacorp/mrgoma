'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { TireSizeInput, buildTireProfile, computeTireProportions } from './tireGeometry';

interface RimProps {
  rimR: number;
  halfWidth: number;
}

/** Simple 5-spoke alloy wheel that fills the tire bore. Axle is the Y axis. */
const Rim = ({ rimR, halfWidth }: RimProps) => {
  const spokes = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2), []);
  const faceY = halfWidth * 0.78; // pushed toward the outboard face
  const barrelH = halfWidth * 1.5;

  return (
    <group>
      {/* Barrel */}
      <mesh castShadow>
        <cylinderGeometry args={[rimR * 0.96, rimR * 0.96, barrelH, 48]} />
        <meshStandardMaterial color="#23262b" metalness={0.85} roughness={0.45} />
      </mesh>

      {/* Outer lip ring */}
      <mesh position={[0, faceY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rimR * 0.92, rimR * 0.07, 16, 48]} />
        <meshStandardMaterial color="#9aa1a8" metalness={0.95} roughness={0.28} />
      </mesh>

      {/* Hub */}
      <mesh position={[0, faceY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[rimR * 0.22, rimR * 0.22, halfWidth * 0.5, 24]} />
        <meshStandardMaterial color="#b8bdc4" metalness={0.95} roughness={0.25} />
      </mesh>

      {/* Spokes */}
      {spokes.map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * rimR * 0.5, faceY, Math.sin(a) * rimR * 0.5]}
          rotation={[0, -a, 0]}
          castShadow
        >
          <boxGeometry args={[rimR * 0.62, halfWidth * 0.35, rimR * 0.16]} />
          <meshStandardMaterial color="#aeb4bb" metalness={0.95} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

interface TireMeshProps {
  size: TireSizeInput;
  /** Whether the wheel slowly auto-rotates (disabled under reduced motion). */
  spin: boolean;
}

const TireMesh = ({ size, spin }: TireMeshProps) => {
  const spinner = useRef<THREE.Group>(null);

  const { rimR, halfWidth } = useMemo(
    () => computeTireProportions(size),
    [size.width, size.aspect, size.diameter]
  );

  const tireGeo = useMemo(() => {
    const profile = buildTireProfile(rimR, 1, halfWidth);
    const g = new THREE.LatheGeometry(profile, 120);
    g.computeVertexNormals();
    return g;
  }, [rimR, halfWidth]);

  // LatheGeometry is created imperatively, so dispose the previous one when the
  // size changes or the component unmounts (r3f does not auto-dispose props).
  useEffect(() => () => tireGeo.dispose(), [tireGeo]);

  useFrame((_, dt) => {
    if (spin && spinner.current) {
      spinner.current.rotation.y += dt * 0.35;
    }
  });

  return (
    // Outer group orients the axle toward the camera; inner group spins on the axle.
    <group rotation={[Math.PI / 2, 0, 0]}>
      <group ref={spinner}>
        <mesh geometry={tireGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#15171a"
            roughness={0.5}
            metalness={0}
            clearcoat={0.3}
            clearcoatRoughness={0.55}
          />
        </mesh>
        <Rim rimR={rimR} halfWidth={halfWidth} />
      </group>
    </group>
  );
};

export default TireMesh;
