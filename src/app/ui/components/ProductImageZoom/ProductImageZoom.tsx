'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { createPortal } from 'react-dom';

import { Dialog, XMarkIcon } from '@/app/ui/components';

interface ProductImageZoomProps {
  /** Original (remote) image URL — also used un-optimized for the crisp zoom layers. */
  src: string;
  alt: string;
  /** Disable zoom entirely (e.g. the generic fallback image has nothing to inspect). */
  enabled?: boolean;
  /** Passed through to the base next/image for correct responsive sizing. */
  sizes?: string;
}

const LENS = 168; // lens diameter in px
const ZOOM = 2.4; // magnification factor

/**
 * Wraps the detail page's main product image with two complementary zoom modes:
 *
 *  - Desktop (hover + fine pointer): a circular magnifier lens follows the
 *    cursor. The lens shows the ORIGINAL image scaled by ZOOM with object-fit
 *    contain, so the magnified letterboxing matches the base image exactly (no
 *    distortion on white-background tire shots).
 *  - Touch / click: opens a full-screen view (reusing the accessible Dialog
 *    shell) where the photo can be panned and pinch-zoomed to inspect tread and
 *    condition up close.
 *
 * The lens is purely decorative (aria-hidden); keyboard and screen-reader users
 * open the same full-screen view via the button wrapper.
 */
const ProductImageZoom: FC<ProductImageZoomProps> = ({ src, alt, enabled = true, sizes }) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!enabled || !canHover) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setLens(null);
        return;
      }
      setLens({ x, y, w: rect.width, h: rect.height });
    },
    [enabled, canHover]
  );

  const closeFullscreen = useCallback(() => {
    setFullscreen(false);
    setZoomed(false);
  }, []);

  const base = (
    <Image
      alt={alt}
      src={src}
      fill
      className="object-contain object-center"
      sizes={sizes}
      priority={false}
    />
  );

  // Without zoom (fallback image) keep the plain image — no interaction layer.
  if (!enabled) {
    return <div className="absolute inset-0">{base}</div>;
  }

  return (
    <>
      <button
        ref={containerRef}
        type="button"
        onMouseMove={onMove}
        onMouseLeave={() => setLens(null)}
        onClick={() => setFullscreen(true)}
        data-track="open_tire_image_zoom"
        data-track-category="product_detail"
        data-track-label={alt}
        aria-label="Open full-size image to zoom"
        className={`absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 ${
          canHover ? 'cursor-zoom-in' : 'cursor-pointer'
        }`}
      >
        {base}

        {lens && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-20 overflow-hidden rounded-full border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.35)] ring-1 ring-black/10"
            style={{
              width: LENS,
              height: LENS,
              left: lens.x - LENS / 2,
              top: lens.y - LENS / 2,
              background: '#fff',
            }}
          >
            {/* Oversized contained copy of the same image, offset so the point
                under the cursor sits at the lens centre. Raw <img> on purpose:
                the lens needs the original URL at an exact pixel size, not an
                optimized/resized next/image. */}
            <img
              src={src}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                position: 'absolute',
                width: lens.w * ZOOM,
                height: lens.h * ZOOM,
                maxWidth: 'none',
                objectFit: 'contain',
                left: -(lens.x * ZOOM - LENS / 2),
                top: -(lens.y * ZOOM - LENS / 2),
              }}
            />
          </span>
        )}
      </button>

      {/* Portaled to <body> so the overlay escapes the gallery's isolate/
          overflow-hidden stacking context and reliably covers the whole
          viewport (thumbnails included) with the close button reachable. */}
      {fullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <Dialog
            open
            onCloseAction={closeFullscreen}
            ariaLabel={`Zoomed view: ${alt}`}
            className="fixed inset-0 z-[120] flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={closeFullscreen}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={closeFullscreen}
              aria-label="Close zoomed view"
              className="fixed right-4 top-4 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-[0_2px_14px_rgba(0,0,0,0.6)] ring-2 ring-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <XMarkIcon className="h-7 w-7" aria-hidden />
            </button>

            {/* Contained zoom: only the main image scales (tap to toggle), and
                page pinch-zoom is suppressed so the close button stays
                reachable. When zoomed the image overflows and can be panned. */}
            <div
              className={`relative h-[92dvh] w-full overflow-auto overscroll-contain ${
                zoomed ? 'block' : 'flex items-center justify-center'
              }`}
              style={{ touchAction: zoomed ? 'pan-x pan-y' : 'none' }}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                onClick={() => setZoomed(z => !z)}
                data-track={zoomed ? 'tire_image_zoom_out' : 'tire_image_zoom_in'}
                data-track-category="product_detail"
                className={`block select-none ${
                  zoomed
                    ? 'h-auto w-[180%] max-w-none cursor-zoom-out'
                    : 'max-h-full max-w-full cursor-zoom-in object-contain'
                }`}
              />
            </div>

            <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/90">
              Tap image to zoom · tap outside to close
            </p>
          </Dialog>,
          document.body
        )}
    </>
  );
};

export default ProductImageZoom;
