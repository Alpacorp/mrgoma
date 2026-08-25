import { SHIPPING, WARRANTY } from '@/app/utils/brandClaims';

/**
 * The four promises shown under every tire.
 *
 * The claims come from `brandClaims` rather than being retyped. Before that this
 * file said "up to 30 days warranty" — which both diverges from the site's
 * `30-Day Warranty` and weakens it with an "up to" nothing else claims — and
 * "Free US shipping" against the canonical "Free shipping nationwide". Same
 * defect as the WhatsApp number and the founding year: one promise, several
 * spellings.
 */
export const benefits = [
  {
    id: 1,
    icon: (
      <span aria-hidden="true" className="text-3xl mx-auto">
        🛡️
      </span>
    ),
    title: 'Guaranteed tires',
    description: `High-quality tires, every used one backed by a ${WARRANTY}. Specializing in luxury brands.`,
  },
  {
    id: 2,
    icon: (
      <span aria-hidden="true" className="text-3xl mx-auto">
        📞
      </span>
    ),
    title: 'After-sales support',
    description:
      'Rely on our after-sales support for troubleshooting and inquiries to ensure your satisfaction.',
  },
  {
    id: 3,
    icon: (
      <span aria-hidden="true" className="text-3xl mx-auto">
        🚚
      </span>
    ),
    title: 'Fast shipping',
    /**
     * This used to offer "Canada, Hawaii, Puerto Rico, request a quote" while
     * checkout refuses Alaska, Hawaii and Puerto Rico outright — so a buyer in
     * Hawaii read an invitation here and hit a wall at payment.
     */
    description: `${SHIPPING} to the continental US, same-day before 4 p.m., insurance included.`,
  },
  {
    id: 4,
    icon: (
      <span aria-hidden="true" className="text-3xl mx-auto">
        🔧
      </span>
    ),
    title: 'Certified technicians',
    description: 'Trust certified ASE technicians at MrGoma Tires for professional service.',
  },
];
