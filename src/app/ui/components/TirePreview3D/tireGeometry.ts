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

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

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
  // Clamp to realistic ranges so a wildly disproportionate size (e.g. a typo in
  // free-text search) never renders a grotesque model — it just pins to the
  // nearest plausible tire.
  const widthMm = clamp(num(input.width, 225), 125, 355);
  const aspect = clamp(num(input.aspect, 45), 25, 85);
  const rimIn = clamp(num(input.diameter, 17), 12, 24);

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
 * THREE.LatheGeometry. Points are (radius, axialPosition).
 *
 * The profile is smooth (no carved grooves) so the silhouette reads as one
 * solid tire from any angle — the tread blocks/grooves come from the procedural
 * normal map instead. The tread is gently crowned and the sidewalls bulge for a
 * realistic shape. Indices keep the tread roughly in V 0.34–0.66 to line up
 * with the texture layout in tireTextures.ts.
 */
export function buildTireProfile(rimR: number, overallR: number, halfWidth: number): THREE.Vector2[] {
  const hw = halfWidth;
  const sidewall = overallR - rimR;
  const t = overallR;

  return [
    new THREE.Vector2(rimR, -hw * 0.95), // bead (one side)
    new THREE.Vector2(rimR + sidewall * 0.3, -hw * 1.0), // widest sidewall bulge
    new THREE.Vector2(rimR + sidewall * 0.66, -hw * 0.95), // upper sidewall
    new THREE.Vector2(t * 0.965, -hw * 0.82), // shoulder
    new THREE.Vector2(t, -hw * 0.62), // tread edge
    new THREE.Vector2(t * 1.006, 0), // crown (slightly larger at center)
    new THREE.Vector2(t, hw * 0.62), // tread edge
    new THREE.Vector2(t * 0.965, hw * 0.82), // shoulder
    new THREE.Vector2(rimR + sidewall * 0.66, hw * 0.95), // upper sidewall
    new THREE.Vector2(rimR + sidewall * 0.3, hw * 1.0), // widest sidewall bulge
    new THREE.Vector2(rimR, hw * 0.95), // bead (other side)
  ];
}
