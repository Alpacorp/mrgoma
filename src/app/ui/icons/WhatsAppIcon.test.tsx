import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WhatsAppIcon } from './WhatsAppIcon';

describe('WhatsAppIcon', () => {
  it('renders an svg', () => {
    const { container } = render(<WhatsAppIcon />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  /**
   * Both original callers sized the glyph with Tailwind classes rather than
   * width/height attributes. If `className` stopped reaching the element they
   * would silently render at the default size.
   */
  it('forwards className, because that is how callers size it', () => {
    const { container } = render(<WhatsAppIcon className="h-5 w-5 shrink-0" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toBe('h-5 w-5 shrink-0');
  });

  it('falls back to a sane size when nothing is passed', () => {
    const { container } = render(<WhatsAppIcon />);
    expect(container.querySelector('svg')?.getAttribute('class')).toBe('w-6 h-6');
  });

  it('is decorative — it never announces itself', () => {
    const { container } = render(<WhatsAppIcon />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
