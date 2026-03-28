export interface TireDescriptionParams {
  brand?: string;
  model?: string;
  size?: string;
  condition?: string;
  remainingLife?: string;
  treadDepth?: string;
  patched?: string;
  loadIndex?: string;
  speedIndex?: string;
}

/**
 * Generates a human-readable, SEO-friendly description for a tire
 * from its structured data fields. Used for visual display and JSON-LD.
 */
export function generateTireDescription(params: TireDescriptionParams): string {
  const isNew = (params.condition || '').toLowerCase() === 'new';
  const isUsed = (params.condition || '').toLowerCase() === 'used';

  const sentences: string[] = [];

  // Intro: condition + brand + model + size
  const condLabel = isNew ? 'Brand new' : isUsed ? 'Used' : 'Quality';
  const brandPart = [params.brand, params.model].filter(Boolean).join(' ');
  const sizePart = params.size ? ` (${params.size})` : '';
  sentences.push(`${condLabel} ${brandPart}${sizePart} tire.`);

  // Used-specific: tread life + depth + patched status
  if (isUsed) {
    const hasLife = Boolean(params.remainingLife && params.remainingLife !== '-');
    const hasTread = Boolean(params.treadDepth && params.treadDepth !== '-');

    if (hasLife && hasTread) {
      sentences.push(
        `Approximately ${params.remainingLife} tread life remaining, with a tread depth of ${params.treadDepth}/32".`
      );
    } else if (hasLife) {
      sentences.push(`Approximately ${params.remainingLife} tread life remaining.`);
    } else if (hasTread) {
      sentences.push(`Tread depth: ${params.treadDepth}/32".`);
    }

    if (params.patched === 'No') {
      sentences.push('No patches or repairs — ready to install.');
    } else if (params.patched === 'Yes') {
      sentences.push('Note: this tire has been patched and repaired.');
    }
  }

  // Technical specs
  const specs: string[] = [];
  if (params.loadIndex && params.loadIndex !== '-') specs.push(`Load Index ${params.loadIndex}`);
  if (params.speedIndex && params.speedIndex !== '-') specs.push(`Speed Index ${params.speedIndex}`);
  if (specs.length > 0) sentences.push(`${specs.join(', ')}.`);

  sentences.push('Free shipping. Available at MrGoma Tires in Miami, FL.');

  return sentences.join(' ');
}
