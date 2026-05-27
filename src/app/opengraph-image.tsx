import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MrGoma Tires – New & Used Tires in Miami & Orlando, FL';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
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
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#9dfb40',
            display: 'flex',
          }}
        />

        {/* Background circle decoration */}
        <div
          style={{
            position: 'absolute',
            right: '-120px',
            top: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '2px solid rgba(157,251,64,0.12)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            top: '-60px',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            border: '2px solid rgba(157,251,64,0.08)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-100px',
            bottom: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '2px solid rgba(157,251,64,0.08)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0px',
            zIndex: 1,
          }}
        >
          {/* Brand name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0px',
            }}
          >
            <span
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-4px',
                lineHeight: 1,
              }}
            >
              Mr
            </span>
            <span
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: '#9dfb40',
                letterSpacing: '-4px',
                lineHeight: 1,
              }}
            >
              Goma
            </span>
          </div>

          {/* TIRES label */}
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#9dfb40',
              letterSpacing: '12px',
              marginTop: '-4px',
              display: 'flex',
            }}
          >
            TIRES
          </div>

          {/* Divider */}
          <div
            style={{
              width: '60px',
              height: '2px',
              background: 'rgba(157,251,64,0.5)',
              margin: '28px 0',
              display: 'flex',
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: '30px',
              color: '#e5e5e5',
              textAlign: 'center',
              lineHeight: 1.4,
              fontWeight: 400,
              display: 'flex',
            }}
          >
            New & Used Tires · Miami & Orlando, FL
          </div>

          {/* Trust signals */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '36px',
              alignItems: 'center',
            }}
          >
            {['7 Locations', '3,600+ Tires', '180-Day Warranty', 'Free Shipping'].map(
              (item, i, arr) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '16px',
                      color: '#9dfb40',
                      fontWeight: 600,
                      background: 'rgba(157,251,64,0.1)',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid rgba(157,251,64,0.3)',
                    }}
                  >
                    {item}
                  </span>
                  {i < arr.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>·</span>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '16px',
            letterSpacing: '1px',
            display: 'flex',
          }}
        >
          www.mrgomatires.com
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(157,251,64,0.4)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
