import * as THREE from 'three';

/**
 * Procedural tire surface maps (no external assets).
 *
 * We draw a grayscale heightmap laid out along the LatheGeometry's V axis
 * (0 = one bead → 1 = the other bead) and the full circumference along U, then
 * convert it to a normal map. The tread band carries blocks + lateral grooves +
 * sipes; the sidewalls get faint concentric detail and a rim-protector ridge.
 * A matching roughness map makes groove bottoms look duller than block tops.
 *
 * V layout matches buildTireProfile(): tread sits roughly in V 0.34–0.66.
 */

const W = 1024; // full circumference
const H = 512; // across the section (V)

const TREAD_TOP = 0.34 * H;
const TREAD_BOT = 0.66 * H;

const makeCanvas = (w: number, h: number): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const drawHeight = (ctx: CanvasRenderingContext2D): void => {
  // Neutral mid height everywhere.
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);

  // --- Sidewalls: concentric ribs, rim-protector ridge and embossed lettering ---
  ctx.lineWidth = 3;
  for (let i = 1; i < 7; i++) {
    const f = i / 7;
    ctx.strokeStyle = 'rgb(150,150,150)';
    const yTop = f * TREAD_TOP;
    const yBot = H - f * (H - TREAD_BOT);
    ctx.beginPath();
    ctx.moveTo(0, yTop);
    ctx.lineTo(W, yTop);
    ctx.moveTo(0, yBot);
    ctx.lineTo(W, yBot);
    ctx.stroke();
  }
  // Raised rim-protector ridge near each bead.
  ctx.fillStyle = '#a6a6a6';
  ctx.fillRect(0, TREAD_TOP * 0.16, W, 16);
  ctx.fillRect(0, H - (H - TREAD_BOT) * 0.16 - 16, W, 16);

  // Embossed brand + size lettering (raised text around the sidewall).
  ctx.textBaseline = 'middle';
  const drawRing = (text: string, y: number, font: string, shade: number): void => {
    ctx.font = font;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    const tw = ctx.measureText(text).width;
    for (let x = 0; x < W + tw; x += tw) ctx.fillText(text, x - tw, y);
  };
  drawRing('MR GOMA   -   ALL  TERRAIN   -   ', TREAD_TOP * 0.52, 'bold 30px Arial', 172);
  drawRing('255/70R18   -   ', H - (H - TREAD_BOT) * 0.5, 'bold 22px Arial', 150);

  // --- Tread base (raised block tops) ---
  ctx.fillStyle = '#9e9e9e';
  ctx.fillRect(0, TREAD_TOP, W, TREAD_BOT - TREAD_TOP);

  const treadH = TREAD_BOT - TREAD_TOP;
  // 3 deep circumferential grooves -> 4 ribs (an extra central rib for a finer,
  // highway-style pattern: |__|..|___|..|___|..|__|).
  const ribs = 4;
  const ribH = treadH / ribs;
  ctx.fillStyle = '#2b2b2b';
  for (let g = 1; g < ribs; g++) {
    const y = TREAD_TOP + g * ribH - 7;
    ctx.fillRect(0, y, W, 14);
  }

  // Chunky lateral blocks (fewer, bigger) with a brick offset + a central sipe.
  const cols = 30;
  const colW = W / cols;
  for (let r = 0; r < ribs; r++) {
    const y0 = TREAD_TOP + r * ribH + 8;
    const y1 = TREAD_TOP + (r + 1) * ribH - 8;
    const offset = (r % 2) * colW * 0.5; // brick pattern
    for (let c = 0; c <= cols; c++) {
      const x = c * colW + offset;
      ctx.fillStyle = '#363636';
      ctx.fillRect(x - 5, y0, 10, y1 - y0); // lateral groove
      ctx.fillStyle = '#717171';
      ctx.fillRect(x + colW * 0.5 - 1.5, y0 + 4, 3, y1 - y0 - 8); // sipe
    }
  }

  // Aggressive shoulder lugs — chunky blocks spilling onto both shoulders.
  const lugW = W / 22;
  ctx.fillStyle = '#9a9a9a';
  for (let c = 0; c < 22; c++) {
    const x = c * lugW;
    ctx.fillRect(x + 4, TREAD_TOP - 22, lugW - 8, 24); // upper shoulder lug
    ctx.fillRect(x + 4, TREAD_BOT - 2, lugW - 8, 24); // lower shoulder lug
  }
};

const heightToNormal = (height: HTMLCanvasElement, strength: number): HTMLCanvasElement => {
  const sctx = height.getContext('2d')!;
  const src = sctx.getImageData(0, 0, W, H).data;
  const out = makeCanvas(W, H);
  const octx = out.getContext('2d')!;
  const img = octx.createImageData(W, H);
  const dst = img.data;

  // Tileable sampling (wrap on both axes).
  const at = (x: number, y: number): number =>
    src[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * W + x) * 4;
      dst[i] = ((dx / len) * 0.5 + 0.5) * 255;
      dst[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      dst[i + 2] = (1 / len) * 0.5 * 255 + 128;
      dst[i + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
};

const heightToRoughness = (height: HTMLCanvasElement): HTMLCanvasElement => {
  const sctx = height.getContext('2d')!;
  const src = sctx.getImageData(0, 0, W, H).data;
  const out = makeCanvas(W, H);
  const octx = out.getContext('2d')!;
  const img = octx.createImageData(W, H);
  const dst = img.data;
  for (let p = 0; p < W * H; p++) {
    const h = src[p * 4] / 255; // 0 = groove, 1 = block top
    // groove bottoms duller (rougher), worn block tops slightly less rough.
    const rough = 0.97 - h * 0.18;
    const v = Math.round(rough * 255);
    dst[p * 4] = v;
    dst[p * 4 + 1] = v;
    dst[p * 4 + 2] = v;
    dst[p * 4 + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
};

export interface TireSurfaceMaps {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  dispose: () => void;
}

/** Build the procedural normal + roughness maps for the tire rubber. */
export const buildTireSurface = (): TireSurfaceMaps => {
  const height = makeCanvas(W, H);
  drawHeight(height.getContext('2d')!);

  const normalMap = new THREE.CanvasTexture(heightToNormal(height, 4));
  normalMap.colorSpace = THREE.NoColorSpace;
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.ClampToEdgeWrapping;
  normalMap.anisotropy = 8;

  const roughnessMap = new THREE.CanvasTexture(heightToRoughness(height));
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;

  return {
    normalMap,
    roughnessMap,
    dispose: () => {
      normalMap.dispose();
      roughnessMap.dispose();
    },
  };
};
