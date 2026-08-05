import { ImageResponse } from 'next/og';

export const alt = 'MrGoma Tires – New & Used Tires in Miami & Orlando, FL';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Google renders this next to the search result at roughly 96×96. The previous
 * design was a near-black card with a 30px tagline and a row of 16px pills; at
 * thumbnail size that collapses into an unreadable dark square, which is exactly
 * what the live US result showed.
 *
 * So this is designed for the small size first: a bright brand-green field and
 * one very large wordmark, with nothing that has to be *read* for the image to
 * say "MrGoma". The supporting line exists for the full 1200×630 rendering used
 * in social shares — it is not load-bearing at thumbnail size.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#9dfb40',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Oversized tire silhouette. Reads as a shape, not as detail, so it
            still registers when the image is scaled to a favicon-sized square. */}
        <div
          style={{
            position: 'absolute',
            right: '-90px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            border: '64px solid #0a0a0a',
            opacity: 0.14,
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          {/* The wordmark. Deliberately enormous: at 96px wide this is the only
              thing that survives, and it has to be enough. */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span
              style={{
                fontSize: '180px',
                fontWeight: 900,
                color: '#0a0a0a',
                letterSpacing: '-8px',
                lineHeight: 1,
              }}
            >
              Mr
            </span>
            <span
              style={{
                fontSize: '180px',
                fontWeight: 900,
                color: '#0a0a0a',
                letterSpacing: '-8px',
                lineHeight: 1,
              }}
            >
              Goma
            </span>
          </div>

          <div
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#0a0a0a',
              letterSpacing: '18px',
              marginTop: '4px',
              marginRight: '-18px',
              display: 'flex',
            }}
          >
            TIRES
          </div>

          {/* For the full-size share rendering only. */}
          <div
            style={{
              marginTop: '40px',
              fontSize: '30px',
              fontWeight: 700,
              color: '#0a0a0a',
              opacity: 0.75,
              textAlign: 'center',
              display: 'flex',
            }}
          >
            New &amp; Used Tires · 30-Day Warranty · Miami &amp; Orlando, FL
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '14px',
            background: '#0a0a0a',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
