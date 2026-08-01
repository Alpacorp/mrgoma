import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HeroVideo from './HeroVideo';

/**
 * jsdom implements no media pipeline, so `play()` has to be stubbed. What these
 * tests pin is the decision logic, which is where the bug lived: whether we ask
 * the element to play at all, and whether we respect reduced motion.
 */
function stubPlayback({ paused = true }: { paused?: boolean } = {}) {
  const play = vi.fn().mockResolvedValue(undefined);
  const pause = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { value: play, writable: true, configurable: true });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { value: pause, writable: true, configurable: true });
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { get: () => paused, configurable: true });
  return { play, pause };
}

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

const props = { src: '/hero.mp4', poster: '/hero.webp' };

afterEach(() => vi.unstubAllGlobals());

describe('HeroVideo', () => {
  it('carries every attribute a muted mobile autoplay needs', () => {
    setReducedMotion(false);
    stubPlayback();
    const { container } = render(<HeroVideo {...props} />);
    const video = container.querySelector('video')!;

    // Miss any one of these and mobile browsers refuse to autoplay.
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('poster', '/hero.webp');

    // `muted` is the exception: on a client render React sets it as a property
    // and never writes the attribute. The property is what the browser obeys.
    expect(video.muted).toBe(true);
  });

  // The first-load path — the one the bug was reported on — gets the element
  // from the HTML parser, so there the `muted` *attribute* must be in the
  // markup. Without it the parser leaves the element unmuted and no mobile
  // browser will autoplay it.
  it('emits the muted attribute in the server-rendered markup', () => {
    const markup = renderToStaticMarkup(<HeroVideo {...props} />);

    expect(markup).toMatch(/\smuted(=""|\s|>)/);
    expect(markup).toMatch(/\sautoPlay(=""|\s|>)/i);
    expect(markup).toMatch(/\splaysInline(=""|\s|>)/i);
  });

  it('keeps preload at metadata so the poster still wins the LCP race', () => {
    setReducedMotion(false);
    stubPlayback();
    const { container } = render(<HeroVideo {...props} />);
    expect(container.querySelector('video')).toHaveAttribute('preload', 'metadata');
  });

  // The actual bug: on a fresh document load the parsed element stayed paused.
  // Client-side navigation worked because React created it and it started on
  // its own — so we do the equivalent explicitly.
  it('asks a paused video to play once mounted', () => {
    setReducedMotion(false);
    const { play } = stubPlayback({ paused: true });
    render(<HeroVideo {...props} />);
    expect(play).toHaveBeenCalled();
  });

  it('leaves an already-playing video alone', () => {
    setReducedMotion(false);
    const { play } = stubPlayback({ paused: false });
    render(<HeroVideo {...props} />);
    expect(play).not.toHaveBeenCalled();
  });

  it('retries when the media data arrives, since metadata alone may not be enough', () => {
    setReducedMotion(false);
    const { play } = stubPlayback({ paused: true });
    const { container } = render(<HeroVideo {...props} />);

    play.mockClear();
    container.querySelector('video')!.dispatchEvent(new Event('loadeddata'));
    expect(play).toHaveBeenCalled();
  });

  it('swallows a refused autoplay instead of throwing', async () => {
    setReducedMotion(false);
    const { play } = stubPlayback({ paused: true });
    play.mockRejectedValue(new DOMException('NotAllowedError'));

    expect(() => render(<HeroVideo {...props} />)).not.toThrow();
    await Promise.resolve();
  });

  it('honours prefers-reduced-motion by staying on the poster', () => {
    setReducedMotion(true);
    const { play, pause } = stubPlayback({ paused: true });
    render(<HeroVideo {...props} />);

    expect(play).not.toHaveBeenCalled();
    expect(pause).toHaveBeenCalled();
  });

  it('stays hidden from assistive technology — it is decorative', () => {
    setReducedMotion(false);
    stubPlayback();
    render(<HeroVideo {...props} />);
    expect(screen.queryByRole('presentation')).toBeNull();
    expect(document.querySelector('video')).toHaveAttribute('aria-hidden', 'true');
  });
});
