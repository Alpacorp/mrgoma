import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import JsonLd from './JsonLd';

/**
 * These assertions run against the **server** markup, because that is the bytes
 * Google's parser receives. Rendering into jsdom would set `textContent`
 * directly and never exercise HTML serialization, which is the thing under test.
 */
function scriptContents(markup: string): string[] {
  return [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    m => m[1]
  );
}

describe('JsonLd', () => {
  it('keeps ampersands and angle brackets intact so the JSON still parses', () => {
    // `&` is the case most often (wrongly) claimed to break JSON-LD in React.
    const data = {
      '@type': 'Organization',
      name: 'MrGoma Tires',
      description: '7 locations in Miami & Orlando, FL — "like-new" used tires <since 2006>',
    };

    const markup = renderToStaticMarkup(<JsonLd data={data} />);
    const [contents] = scriptContents(markup);

    expect(JSON.parse(contents)).toEqual(data);
    expect(contents).toContain('Miami & Orlando');
  });

  it('neutralises a value that tries to close the script element', () => {
    const data = { name: 'Tire</script><img src=x onerror=alert(1)>' };

    const markup = renderToStaticMarkup(<JsonLd data={data} />);

    // Exactly one closing tag: the element's own. The payload's `</script>`
    // was neutralised rather than emitted literally, so it cannot break out.
    expect(markup.match(/<\/script>/g)).toHaveLength(1);

    // The real property: once a browser parses this, the injected markup is
    // inert script text, not an element. (The raw bytes still *contain* the
    // `<img …>` characters — that is expected and harmless.)
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    expect(parsed.querySelector('img')).toBeNull();
    expect(parsed.querySelectorAll('script')).toHaveLength(1);

    // ...and it is still valid JSON that round-trips to the original value.
    const [contents] = scriptContents(markup);
    expect(JSON.parse(contents)).toEqual(data);
  });

  it('emits one script per node when given an array', () => {
    const markup = renderToStaticMarkup(<JsonLd data={[{ a: 1 }, { b: 2 }]} />);
    const contents = scriptContents(markup);

    expect(contents).toHaveLength(2);
    expect(contents.map(c => JSON.parse(c))).toEqual([{ a: 1 }, { b: 2 }]);
  });
});
