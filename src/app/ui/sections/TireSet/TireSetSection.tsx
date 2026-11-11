import type { SingleTire } from '@/app/interfaces/tires';
import {
  anchorFromTire,
  availableSetSizes,
  countJoinable,
  isQuantityMode,
  setTotal,
  suggestSet,
  type SetUnit,
} from '@/app/utils/tireSets';
import { getCachedSetCandidates, setGroupOf } from '@/repositories/tireSetsRepository';

import TireSetPanel from './TireSetPanel';

const isSold = (tire: SingleTire) =>
  typeof tire.status === 'string' && tire.status.trim().toLowerCase() === 'sold';

/**
 * "Build your set" on the detail page (feature 041). A Server Component streamed
 * behind `<Suspense>`: the candidates query never delays the tire's own content.
 *
 * Renders nothing — and the page reads exactly as before — when the tire is sold
 * (D12), cannot form groups (no model), or has no compatible tire (FR3).
 */
export default async function TireSetSection({ tire }: { tire: SingleTire }) {
  if (isSold(tire)) return null;
  const group = setGroupOf(tire);
  if (!group) return null;

  let candidates: SetUnit[];
  try {
    candidates = await getCachedSetCandidates(group);
  } catch {
    // The set block is an extra; a failing query must never break the page.
    return null;
  }

  const anchor = anchorFromTire(tire);
  const others = candidates.filter(c => c.id !== anchor.id);
  const sizes = availableSetSizes(anchor, others);
  if (sizes.length === 0) return null;

  const more = countJoinable(anchor, others);
  const fromSize = sizes[0];
  const fromTotal = setTotal(suggestSet(anchor, others, fromSize) ?? []);

  return (
    <TireSetPanel
      anchor={anchor}
      candidates={others}
      more={more}
      sizes={sizes}
      fromSize={fromSize}
      fromTotal={fromTotal}
      quantityMode={isQuantityMode(anchor)}
      product={{ brand: tire.brand, model2: tire.model2, size: tire.size }}
    />
  );
}
