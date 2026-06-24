import { describe, expect, it } from 'vitest';

import { generateTireDescription } from './tireDescription';

describe('generateTireDescription', () => {
  it('describes a brand-new tire', () => {
    const d = generateTireDescription({
      brand: 'Michelin',
      model: 'Pilot',
      size: '225/40/18',
      condition: 'new',
    });
    expect(d).toContain('Brand new Michelin Pilot (225/40/18) tire.');
    expect(d).toContain('Free shipping. Available at MrGoma Tires in Miami, FL.');
  });

  it('includes tread life, depth and patched status for used tires', () => {
    const d = generateTireDescription({
      brand: 'Toyo',
      condition: 'used',
      remainingLife: '70%',
      treadDepth: '7',
      patched: 'No',
    });
    expect(d).toContain('Used Toyo tire.');
    expect(d).toContain('70% tread life remaining');
    expect(d).toContain('tread depth of 7/32"');
    expect(d).toContain('No patches or repairs');
  });

  it('appends load and speed index specs', () => {
    const d = generateTireDescription({ condition: 'new', loadIndex: '91', speedIndex: 'V' });
    expect(d).toContain('Load Index 91, Speed Index V.');
  });

  it('ignores placeholder "-" values', () => {
    const d = generateTireDescription({ condition: 'used', remainingLife: '-', treadDepth: '-' });
    expect(d).not.toContain('tread life remaining');
    expect(d).not.toContain('Tread depth');
  });
});
