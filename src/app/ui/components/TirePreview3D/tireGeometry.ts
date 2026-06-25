import * as THREE from 'three';

/**
 * Tire size as picked in the UI (strings from the dropdowns or numbers).
 *  - width:    section width in mm (e.g. 225)
 *  - aspect:   aspect ratio / sidewall as a percentage (e.g. 45)
 *  - diameter: rim diameter in inches (e.g. 17)
 */
export type TireSizeInput = {
  width?: number | string;
  aspect?: number | string;
  diameter?: number | string;
};

const num = (v: unknown, fallback: number): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export type TireProportions = {
  /** Outer radius, normalized to 1 so the tire always frames the same. */
  overallR: number;
  /** Rim (bead) radius as a fraction of the outer radius. */
  rimR: number;
  /** Half of the section width, in the same normalized units. */
  halfWidth: number;
  raw: { widthMm: number; aspect: number; rimIn: number };
};

/**
 * Turn a tire size code into real, proportional dimensions.
 *
 * We normalize the OUTER radius to 1 so the model stays framed; what visibly
 * changes between sizes is the sidewall/rim ratio and the section width — which
 * is exactly what the numbers in "225/45R17" mean. Defaults approximate a
 * common 225/45R17 when the customer hasn't picked everything yet.
 */
export function computeTireProportions(input: TireSizeInput): TireProportions {
  const widthMm = num(input.width, 225);
  const aspect = num(input.aspect, 45);
  const rimIn = num(input.diameter, 17);

  const rimMm = rimIn * 25.4;
  const sidewallMm = (widthMm * aspect) / 100;
  const overallMm = rimMm + 2 * sidewallMm;
  const overallR = overallMm / 2;

  const scale = 1 / overallR; // normalize outer radius to 1
  return {
    overallR: 1,
    rimR: (rimMm / 2) * scale,
    halfWidth: (widthMm * scale) / 2,
    raw: { widthMm, aspect, rimIn },
  };
}

/**
 * Cross-section profile of the rubber, revolved around the axle (Y) by
 * THREE.LatheGeometry. Points are (radius, axialPosition). A few inward dips in
 * the tread region become real circumferential grooves once revolved — which is
 * exactly how a tire's longitudinal grooves run.
 */
export function buildTireProfile(rimR: number, overallR: number, halfWidth: number): THREE.Vector2[] {
  const hw = halfWidth;
  const sidewall = overallR - rimR;
  const groove = overallR * 0.055;
  const t = overallR;

  return [
    new THREE.Vector2(rimR, -hw * 0.92), // inner bead (one side)
    new THREE.Vector2(rimR + sidewall * 0.45, -hw * 1.0), // sidewall bulge
    new THREE.Vector2(t * 0.985, -hw * 0.86), // shoulder
    new THREE.Vector2(t, -hw * 0.62), // tread starts
    new THREE.Vector2(t - groove, -hw * 0.52), // groove
    new THREE.Vector2(t, -hw * 0.42), // rib
    new THREE.Vector2(t, -hw * 0.14),
    new THREE.Vector2(t - groove, 0), // center groove
    new THREE.Vector2(t, hw * 0.14),
    new THREE.Vector2(t, hw * 0.42), // rib
    new THREE.Vector2(t - groove, hw * 0.52), // groove
    new THREE.Vector2(t, hw * 0.62), // tread ends
    new THREE.Vector2(t * 0.985, hw * 0.86), // shoulder
    new THREE.Vector2(rimR + sidewall * 0.45, hw * 1.0), // sidewall bulge
    new THREE.Vector2(rimR, hw * 0.92), // inner bead (other side)
  ];
}
