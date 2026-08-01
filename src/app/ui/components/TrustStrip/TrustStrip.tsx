import { FC } from 'react';

type TrustStripVariant = 'solid' | 'onMedia';

interface TrustStripProps {
  /** The claims to render. Source them from `@/app/utils/brandClaims`. */
  items: readonly string[];
  /**
   * `solid` — over a flat dark section (the `/tires` hero).
   * `onMedia` — over the home hero video, where the backdrop frame is unknown,
   * so the pill carries its own opaque-enough background.
   */
  variant?: TrustStripVariant;
  className?: string;
  /** Accessible name for the list region. */
  label?: string;
}

/**
 * The claims strip that Google reads.
 *
 * This is the markup that produced the strong `/tires` search snippet — Google
 * assembled that description from this text, not from a meta description. It
 * was extracted here so the home page and the listing pages state the same
 * claims from the same component instead of drifting apart.
 *
 * A server component by design: it must be plain text in the HTML response, with
 * no image, no extra font and no client JS, so it costs nothing in LCP/INP and
 * cannot shift layout.
 *
 * Semantics follow the project's HTML guidance — a real `<ul>`/`<li>` for list
 * content, no ARIA roles layered over native elements, and the decorative marker
 * hidden from assistive tech.
 *
 * Contrast (WCAG 2.1 AA): `solid` renders ~7:1 on the `#0a0a0a` sections. The
 * `onMedia` variant keeps a 60%-black backdrop so the text clears 4.5:1 even on
 * the brightest frame of the hero video.
 */
const TrustStrip: FC<TrustStripProps> = ({
  items,
  variant = 'solid',
  className,
  label = 'Why buy from MrGoma Tires',
}) => {
  const itemClass =
    variant === 'onMedia'
      ? 'flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-black/60 border border-white/20 rounded-full px-3 py-1.5'
      : 'flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 rounded-full px-3 py-1.5';

  return (
    <ul
      aria-label={label}
      className={`flex flex-wrap gap-2 sm:gap-3${className ? ` ${className}` : ''}`}
    >
      {items.map(item => (
        <li key={item} className={itemClass}>
          <span className="text-[#9dfb40] text-[10px]" aria-hidden="true">
            ✦
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
};

export default TrustStrip;
