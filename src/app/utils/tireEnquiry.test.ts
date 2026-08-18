import { describe, expect, it } from 'vitest';

import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';
import type { SingleTire } from '@/app/interfaces/tires';

import { buildTireEnquiry } from './tireEnquiry';

const usedTire: SingleTire = {
  id: '471004',
  code: 'A4821',
  status: 'Used',
  name: '(A4821) | BRIDGESTONE | 235/50/20',
  color: 'Black',
  price: '135',
  brand: 'Bridgestone',
  brandId: 3,
  condition: 'Used',
  patched: 'Yes',
  remainingLife: '80%',
  treadDepth: '8.0',
  dot: '2419',
  size: '235/50/20',
  model2: 'Alenza A/S 02',
  images: [],
  details: [],
};

const newTire: SingleTire = {
  ...usedTire,
  condition: 'New',
  status: 'New',
  patched: 'No',
  remainingLife: '100%',
  treadDepth: '10.0',
};

/** Every optional column empty. The mapper writes `'-'`, never null or ''. */
const bareTire: SingleTire = {
  ...usedTire,
  code: undefined,
  model2: undefined,
  price: '-',
  remainingLife: '-',
  treadDepth: '-',
  dot: '-',
  patched: '-',
};

describe('an available tire', () => {
  const msg = buildTireEnquiry(usedTire);

  it('opens the way the business agreed', () => {
    expect(msg.startsWith("Hi MrGoma, I'm interested in this tire:")).toBe(true);
  });

  // AC1
  it('carries everything the person answering would otherwise have to ask for', () => {
    expect(msg).toContain('#A4821');
    expect(msg).toContain('Bridgestone');
    expect(msg).toContain('Alenza A/S 02');
    expect(msg).toContain('Size: 235/50/20');
    expect(msg).toContain('Used');
    expect(msg).toContain('80% life');
    expect(msg).toContain('8.0/32" tread');
    expect(msg).toContain('Price shown: $135');
  });

  it('labels the price as what was displayed, not as a quote', () => {
    expect(msg).toContain('Price shown:');
    expect(msg).not.toMatch(/quote|total|final/i);
  });

  it('mentions a patch only when there is one', () => {
    expect(buildTireEnquiry(usedTire)).toContain('Patched');
    expect(buildTireEnquiry({ ...usedTire, patched: 'No' })).not.toContain('Patched');
  });

  // AC4
  it('ends with the absolute canonical URL of the page it came from', () => {
    const last = msg.trim().split('\n').pop();
    expect(last).toBe('https://www.mrgomatires.com/tires/471004-bridgestone-235-50-20');
  });

  it('leads with the stock code, not the internal id', () => {
    // 471004 is the TireId; it belongs in the URL, not as the identifier staff
    // are asked to search for.
    const firstFact = msg.split('\n')[2];
    expect(firstFact).toContain('#A4821');
    expect(firstFact).not.toContain('471004');
  });
});

// AC2
describe('a new tire', () => {
  const msg = buildTireEnquiry(newTire);

  it('says nothing about remaining life or tread', () => {
    expect(msg).not.toContain('life');
    expect(msg).not.toContain('tread');
    expect(msg).not.toContain('%');
    expect(msg).not.toContain('/32');
  });

  it('still says it is new', () => {
    expect(msg).toContain('New');
  });
});

// AC3 — the single most likely bug, and invisible to TypeScript
describe("a record whose optional columns are all the '-' marker", () => {
  const msg = buildTireEnquiry(bareTire);

  it('shows no bare dash, no empty label and no undefined', () => {
    // Skip the greeting, which legitimately ends in a colon.
    const factLines = msg.split('\n').slice(1);
    for (const line of factLines) {
      expect(line).not.toMatch(/: *-$/);
      expect(line).not.toMatch(/^[A-Za-z ]+: *$/);
    }
    expect(msg).not.toContain('undefined');
    expect(msg).not.toContain('null');
    expect(msg).not.toContain('NaN');
  });

  it('drops the price line rather than printing a dash or $0', () => {
    expect(msg).not.toContain('Price shown');
    expect(msg).not.toContain('$0');
  });

  it('drops the code prefix rather than printing a lone #', () => {
    expect(msg).not.toContain('#');
  });

  it('still identifies the tire and links to it', () => {
    expect(msg).toContain('Bridgestone');
    expect(msg).toContain('https://www.mrgomatires.com/tires/');
  });
});

// AC5
describe('a tire with an unreasonably long name', () => {
  const longModel = 'Alenza '.repeat(40).trim();
  const msg = buildTireEnquiry({ ...usedTire, model2: longModel });

  it('truncates rather than letting the name swallow the message', () => {
    expect(msg).toContain('…');
    const nameLine = msg.split('\n')[2];
    expect(nameLine.length).toBeLessThan(110);
  });

  it('keeps the rest of the message intact', () => {
    expect(msg).toContain('Size: 235/50/20');
    expect(msg).toContain('Price shown: $135');
  });
});

// AC7
describe('a sold tire', () => {
  const msg = buildTireEnquiry({ ...usedTire, status: 'sold' });

  it('says the tire is gone before asking for anything', () => {
    expect(msg.startsWith('Hi MrGoma, I saw this tire is already sold:')).toBe(true);
  });

  it('never reads as interest in buying this one', () => {
    expect(msg).not.toContain("I'm interested in this tire");
  });

  it('asks for another in the same size, which is the actual question', () => {
    expect(msg).toContain('Do you have another one in 235/50/20?');
  });

  it('recognises the status however it is cased', () => {
    expect(buildTireEnquiry({ ...usedTire, status: 'SOLD' })).toContain('already sold');
    expect(buildTireEnquiry({ ...usedTire, status: ' Sold ' })).toContain('already sold');
  });
});

// AC8 — VaultName is internal operational naming and must never reach a customer
describe('no message names a store or a warehouse', () => {
  const messages = [usedTire, newTire, bareTire, { ...usedTire, status: 'sold' }].map(
    buildTireEnquiry
  );

  it('contains no public store name', () => {
    for (const msg of messages) {
      for (const store of locationsConfig) {
        expect(msg).not.toContain(store.name);
      }
    }
  });

  it('contains no internal VaultName value', () => {
    // The real values behind the dashboard's Location filter.
    const vaults = ['Warehouse', 'Semoran', 'Pembroke WH', 'Clifton', '441', '27th Ave'];
    for (const msg of messages) {
      for (const vault of vaults) {
        expect(msg).not.toContain(vault);
      }
    }
  });
});
