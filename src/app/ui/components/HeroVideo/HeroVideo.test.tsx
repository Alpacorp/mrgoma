import { act, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HeroVideo from './HeroVideo';

/**
 * jsdom implements no media pipeline, so playback has to be stubbed. What these
 * tests pin is the decision logic, which is where the bug lived: when we ask the
 * element to play, how we react to a refusal, and what the visitor sees while it
 * is still refusing.
 */
function stubPlayback({ paused = true }: { paused?: boolean } = {}) {
  const state = { paused };
  const play = vi.fn().mockResolvedValue(undefined);
  const pause = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    value: play,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    value: pause,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    get: () => state.paused,
    configurable: true,
  });
  return { play, pause, state };
}

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

const props = { src: '/hero.mp4', poster: '/hero.webp', className: 'absolute inset-0' };

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

    // `muted` is the exception: on a client render React sets it as a property
    // and never writes the attribute. The property is what the browser obeys.
    expect(video.muted).toBe(true);
  });

  // WebKit decides autoplay eligibility during resource selection, so the src
  // belongs on the element — a <source> child has it decide too early.
  it('puts the src on the element rather than in a source child', () => {
    setReducedMotion(false);
    stubPlayback();
    const { container } = render(<HeroVideo {...props} />);

    expect(container.querySelector('video')).toHaveAttribute('src', '/hero.mp4');
    expect(container.querySelector('source')).toBeNull();
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

  // The poster is a layer of its own rather than the element's `poster`
  // attribute, so the video can stay transparent while it is refused.
  describe('the poster layer', () => {
    it('paints the poster from server-rendered markup, before any JS runs', () => {
      const markup = renderToStaticMarkup(<HeroVideo {...props} />);
      expect(markup).toContain('/hero.webp');
    });

    it('sits behind the video and shares its positioning', () => {
      setReducedMotion(false);
      stubPlayback();
      const { container } = render(<HeroVideo {...props} />);
      const [layer, video] = [container.firstElementChild!, container.querySelector('video')!];

      expect(layer.tagName).toBe('DIV');
      expect(layer).toHaveStyle({ backgroundImage: 'url("/hero.webp")' });
      expect(layer.className).toContain('absolute inset-0');
      expect(video.className).toContain('absolute inset-0');
      // Order matters: the video has to be the one on top.
      expect(layer.compareDocumentPosition(video)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  // The second half of the bug report: WebKit draws a play glyph over any video
  // that hasn't started — it was showing through the search card. A transparent
  // element has nothing to draw, in any browser, with no vendor CSS involved.
  describe('while playback is refused', () => {
    it('keeps the video fully transparent', () => {
      setReducedMotion(false);
      const { play } = stubPlayback({ paused: true });
      play.mockRejectedValue(new DOMException('NotAllowedError'));
      const { container } = render(<HeroVideo {...props} />);

      expect(container.querySelector('video')!.className).toContain('opacity-0');
    });

    it('is transparent in the server-rendered markup too', () => {
      expect(renderToStaticMarkup(<HeroVideo {...props} />)).toContain('opacity-0');
    });

    it('never intercepts a tap meant for the page', () => {
      setReducedMotion(false);
      stubPlayback();
      const { container } = render(<HeroVideo {...props} />);
      expect(container.querySelector('video')!.className).toContain('pointer-events-none');
    });
  });

  describe('once it really is playing', () => {
    it('fades the video in', async () => {
      setReducedMotion(false);
      stubPlayback({ paused: true });
      const { container } = render(<HeroVideo {...props} />);

      await waitFor(() =>
        expect(container.querySelector('video')!.className).toContain('opacity-100')
      );
    });

    // Autoplay can beat hydration, in which case the resolved `play()` we would
    // have listened to never happened here — the `playing` event is all we get.
    it('reveals on the playing event even if it never called play itself', async () => {
      setReducedMotion(false);
      const { play } = stubPlayback({ paused: false });
      const { container } = render(<HeroVideo {...props} />);
      const video = container.querySelector('video')!;

      expect(play).not.toHaveBeenCalled();
      act(() => void video.dispatchEvent(new Event('playing')));
      expect(video.className).toContain('opacity-100');
    });
  });

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

  it('retries when the media becomes decodable, since metadata alone may not be', () => {
    setReducedMotion(false);
    const { play } = stubPlayback({ paused: true });
    play.mockRejectedValue(new DOMException('NotAllowedError'));
    const { container } = render(<HeroVideo {...props} />);
    const video = container.querySelector('video')!;

    for (const type of ['loadedmetadata', 'loadeddata', 'canplay']) {
      play.mockClear();
      video.dispatchEvent(new Event(type));
      expect(play, `expected a retry on ${type}`).toHaveBeenCalled();
    }
  });

  // The heart of the fix. Chrome for iOS refuses autoplay unconditionally, and
  // Safari refuses it under Low Power Mode, so the only moment either will
  // start is under user activation — which is also why navigating away and back
  // worked: that tap activated the document.
  it('starts on the first user interaction after a refused autoplay', async () => {
    setReducedMotion(false);
    const { play } = stubPlayback({ paused: true });
    play.mockRejectedValue(new DOMException('NotAllowedError'));
    render(<HeroVideo {...props} />);

    for (const type of ['pointerdown', 'touchend', 'click', 'keydown']) {
      play.mockClear();
      document.dispatchEvent(new Event(type));
      expect(play, `expected a retry on ${type}`).toHaveBeenCalled();
    }
  });

  it('stops chasing playback once the video is actually running', async () => {
    setReducedMotion(false);
    const { play, state } = stubPlayback({ paused: true });
    const { container } = render(<HeroVideo {...props} />);
    await waitFor(() =>
      expect(container.querySelector('video')!.className).toContain('opacity-100')
    );
    state.paused = false;

    play.mockClear();
    document.dispatchEvent(new Event('pointerdown'));
    expect(play).not.toHaveBeenCalled();
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
    const { container } = render(<HeroVideo {...props} />);

    expect(play).not.toHaveBeenCalled();
    expect(pause).toHaveBeenCalled();
    expect(container.querySelector('video')!.className).toContain('opacity-0');
  });

  it('stays out of the accessibility tree and the tab order — it is decorative', () => {
    setReducedMotion(false);
    stubPlayback();
    const { container } = render(<HeroVideo {...props} />);

    expect(screen.queryByRole('presentation')).toBeNull();
    expect(container.querySelector('video')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('video')).toHaveAttribute('tabindex', '-1');
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
