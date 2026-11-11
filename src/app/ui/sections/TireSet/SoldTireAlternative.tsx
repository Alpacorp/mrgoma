import Link from 'next/link';

import type { SingleTire } from '@/app/interfaces/tires';
import { anchorFromTire, closestMatch, type SetUnit } from '@/app/utils/tireSets';
import { buildTireSlug } from '@/app/utils/tireSlug';
import { getCachedSetCandidates, setGroupOf } from '@/repositories/tireSetsRepository';

/**
 * "We have N like this in stock →" on a sold tire's page (feature 045, FR4).
 *
 * "Like this" is 043's rule — same brand, model, size, run-flat and condition,
 * any tread — in **both** cities, through the cached 041 group query. The link
 * opens the closest match (tread → unpatched → price). Renders nothing when
 * there is none or the lookup fails: the page still offers WhatsApp.
 *
 * Passed into `TireInformation` as `soldSlot` by `DetailView`, like 041's set
 * block, so database code stays out of the client component barrel.
 */
export default async function SoldTireAlternative({ tire }: { tire: SingleTire }) {
  const group = setGroupOf(tire);
  if (!group) return null;

  let candidates: SetUnit[];
  try {
    const [here, there] = await Promise.all([
      getCachedSetCandidates(group),
      getCachedSetCandidates({ ...group, city: group.city === 'Miami' ? 'Orlando' : 'Miami' }),
    ]);
    candidates = [...here, ...there].filter(c => c.id !== String(tire.id));
  } catch {
    return null;
  }

  const best = closestMatch(anchorFromTire(tire).tread, candidates);
  if (!best) return null;

  const href = `/tires/${buildTireSlug(best.id, tire.brand ?? '', tire.size ?? '')}`;
  // Each query returns at most 60; 120 means "a lot" — say so rather than a false exact count.
  const count = candidates.length >= 60 ? `${candidates.length}+` : String(candidates.length);

  return (
    <p className="mt-3 text-sm text-gray-800">
      {'This tire is sold. '}
      <Link
        href={href}
        data-track="sold_tire_alternative_open"
        data-track-category="detail"
        className="font-semibold text-green-700 underline underline-offset-2 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-sm"
      >
        {`We have ${count} like it in stock →`}
      </Link>
    </p>
  );
}
