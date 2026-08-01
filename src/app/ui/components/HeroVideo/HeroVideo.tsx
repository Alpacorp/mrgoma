'use client';

import { FC, useEffect, useRef } from 'react';

interface HeroVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * The hero's decorative background video.
 *
 * Exists as a client component for one reason: on a **fresh document load** the
 * `<video>` is created by the HTML parser, and mobile browsers evaluate autoplay
 * eligibility under page-load conditions — with `preload="metadata"` only the
 * metadata is fetched, and the element can settle on its poster and never start.
 * On a client-side navigation back to the home page it always played, because
 * there React *creates* the element and sets `muted`/`autoplay` as properties
 * with no document load competing.
 *
 * So this does on first load what client-side navigation was already doing:
 * after mount, if the element is still paused, ask it to play and swallow the
 * rejection (a refused autoplay is not an error worth surfacing — the poster is
 * a perfectly good fallback).
 *
 * `preload` stays at `metadata` deliberately: bumping it to `auto` would pull
 * the full ~3 MB on mobile and put the LCP work from `002-lcp-fetchpriority` at
 * risk. The poster is what paints, and it is preloaded at high priority.
 *
 * Motion is opt-out: `prefers-reduced-motion` leaves the poster in place, which
 * the constitution requires and the previous markup did not honour.
 */
const HeroVideo: FC<HeroVideoProps> = ({ src, poster, className }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      return;
    }

    // Some browsers only honour muted as a property, and a non-muted video is
    // never allowed to autoplay — so assert it before asking.
    video.muted = true;

    const attempt = () => {
      if (!video.paused) return;
      // `play()` only returns a promise in browsers that implement the newer
      // spec; older ones return undefined, so don't assume there's a `catch`.
      const started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(() => {
          // Autoplay refused (Low Power Mode, data saver, a strict policy).
          // The poster stays, which is the intended fallback.
        });
      }
    };

    attempt();
    // With preload="metadata" there may be nothing decodable yet on first load;
    // try once more as soon as there is.
    video.addEventListener('loadeddata', attempt, { once: true });

    return () => video.removeEventListener('loadeddata', attempt);
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      poster={poster}
      preload="metadata"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default HeroVideo;
