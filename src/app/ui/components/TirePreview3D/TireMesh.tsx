'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { TireSizeInput, buildTireProfile, computeTireProportions } from './tireGeometry';
import { buildTireSurface } from './tireTextures';

interface RimProps {
  rimR: number;
  halfWidth: number;
}

/** Polished multi-spoke (turbine) alloy wheel that fills the tire bore. Axle is the Y axis. */
const Rim = ({ rimR, halfWidth }: RimProps) => {
  const SPOKE_COUNT = 11;
  const spokes = useMemo(
    () => Array.from({ length: SPOKE_COUNT }, (_, i) => (i / SPOKE_COUNT) * Math.PI * 2),
    []
  );
  const faceY = halfWidth * 0.45; // wheel face, inset inside the tire

  const polished = { color: '#c2c7cd', metalness: 1, roughness: 0.18 };
  const matteMetal = { color: '#9097a0', metalness: 1, roughness: 0.38 };

  // A single tapered, swept turbine blade, extruded with a small bevel so its
  // edges catch highlights. Built once and instanced for every spoke.
  const spokeGeo = useMemo(() => {
    const rHub = rimR * 0.18;
    const rRim = rimR * 0.88;
    const wHub = rimR * 0.05; // narrow at the hub
    const wRim = rimR * 0.14; // wider at the rim
    const shape = new THREE.Shape();
    shape.moveTo(rHub, -wHub);
    shape.quadraticCurveTo(rimR * 0.55, -wRim * 0.15, rRim, -wRim * 0.45); // swept side
    shape.lineTo(rRim, wRim * 1.4);
    shape.quadraticCurveTo(rimR * 0.5, wRim, rHub, wHub); // return side
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: halfWidth * 0.22,
      bevelEnabled: true,
      bevelThickness: rimR * 0.018,
      bevelSize: rimR * 0.018,
      bevelSegments: 2,
      curveSegments: 12,
    });
    geo.translate(0, 0, -halfWidth * 0.11); // center the thickness
    geo.rotateX(-Math.PI / 2); // lay into the wheel (X-Z) plane, thickness along the axle
    geo.computeVertexNormals();
    return geo;
  }, [rimR, halfWidth]);

  useEffect(() => () => spokeGeo.dispose(), [spokeGeo]);

  // The axle is the local Y axis (after the parent orientation). Cylinders use
  // their default Y axis (no rotation); only the lip torus is rotated into the
  // wheel (X-Z) plane. The wheel is an OPEN spoked face — no barrel/back plate —
  // so the transparent canvas shows the white card through the spoke windows and
  // behind the wheel.
  return (
    <group>
      {/* Tire inner wall (liner) — dark rubber tube inside the bore so the inner
          wall reads solid black (like a real tire), not see-through to white.
          Open-ended + DoubleSide so the inner-facing surface shows; the center
          spoke windows still see past it to the white backdrop. */}
      <mesh>
        <cylinderGeometry args={[rimR * 0.99, rimR * 0.99, halfWidth * 1.92, 64, 1, true]} />
        <meshStandardMaterial color="#0e0f11" metalness={0} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer wheel lip / rim flange (chunky polished ring) */}
      <mesh position={[0, faceY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[rimR * 0.86, rimR * 0.09, 24, 80]} />
        <meshStandardMaterial {...polished} />
      </mesh>

      {/* Inner ring the spokes tie into */}
      <mesh position={[0, faceY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rimR * 0.74, rimR * 0.05, 16, 64]} />
        <meshStandardMaterial {...matteMetal} />
      </mesh>

      {/* Turbine spokes — tapered, swept blades; gaps between them stay open (white) */}
      {spokes.map((a, i) => (
        <mesh key={i} geometry={spokeGeo} position={[0, faceY, 0]} rotation={[0, -a, 0]} castShadow>
          <meshStandardMaterial {...polished} />
        </mesh>
      ))}

      {/* Hub cap base (polished) */}
      <mesh position={[0, faceY + halfWidth * 0.05, 0]}>
        <cylinderGeometry args={[rimR * 0.22, rimR * 0.23, halfWidth * 0.24, 36]} />
        <meshStandardMaterial {...polished} />
      </mesh>

      {/* Center brand cap (dark, slightly raised) */}
      <mesh position={[0, faceY + halfWidth * 0.16, 0]}>
        <cylinderGeometry args={[rimR * 0.13, rimR * 0.14, halfWidth * 0.14, 28]} />
        <meshStandardMaterial color="#17191c" metalness={0.7} roughness={0.35} />
      </mesh>
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
    const g = new THREE.LatheGeometry(profile, 160);
    g.computeVertexNormals();
    return g;
  }, [rimR, halfWidth]);

  // Procedural rubber maps are size-independent; build once.
  const surface = useMemo(() => buildTireSurface(), []);

  // Dispose imperatively-created resources (r3f doesn't auto-dispose props).
  useEffect(() => () => tireGeo.dispose(), [tireGeo]);
  useEffect(() => () => surface.dispose(), [surface]);

  useFrame((_, dt) => {
    if (spin && spinner.current) {
      spinner.current.rotation.y += dt * 0.3;
    }
  });

  return (
    // Outer group orients the axle toward the camera; inner group spins on the axle.
    <group rotation={[Math.PI / 2, 0, 0]}>
      <group ref={spinner}>
        <mesh geometry={tireGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color="#17191c"
            metalness={0}
            roughness={0.88}
            roughnessMap={surface.roughnessMap}
            normalMap={surface.normalMap}
            normalScale={[1.45, 1.45]}
            envMapIntensity={1}
          />
        </mesh>
        <Rim rimR={rimR} halfWidth={halfWidth} />
      </group>
    </group>
  );
};

export default TireMesh;
