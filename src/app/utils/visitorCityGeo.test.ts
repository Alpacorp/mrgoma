import { describe, expect, it } from 'vitest';

import { locationsData } from '@/app/ui/sections/LocationsSlider/locationsData';

import { cityFromPosition, distanceMiles } from './visitorCityGeo';

const storeId = (name: string) => locationsData.find(l => l.name === name)?.id;

describe('distanceMiles', () => {
  it('measures Miami to Orlando at roughly 200 miles', () => {
    const d = distanceMiles(
      { latitude: 25.7617, longitude: -80.1918 },
      { latitude: 28.5383, longitude: -81.3792 }
    );
    expect(d).toBeGreaterThan(190);
    expect(d).toBeLessThan(215);
  });
});

describe('cityFromPosition (D2: within 60 miles of a store)', () => {
  it('places Cutler Bay at its own store', () => {
    expect(cityFromPosition(25.5808, -80.3468)).toEqual({
      city: 'Miami',
      nearestStoreId: storeId('Cutler Bay'),
    });
  });

  it('places Hialeah at the Hialeah store', () => {
    expect(cityFromPosition(25.8576, -80.2781)).toEqual({
      city: 'Miami',
      nearestStoreId: storeId('Hialeah'),
    });
  });

  it('places Fort Lauderdale (Broward) in Miami', () => {
    expect(cityFromPosition(26.1224, -80.1373)?.city).toBe('Miami');
  });

  it('places Kissimmee in Orlando', () => {
    expect(cityFromPosition(28.2919, -81.4076)?.city).toBe('Orlando');
  });

  it.each([
    ['Tampa', 27.9506, -82.4572],
    ['Jacksonville', 30.3322, -81.6557],
    ['Fort Myers', 26.6406, -81.8723],
    ['New York', 40.7128, -74.006],
  ])('gives no city in %s', (_name, lat, lng) => {
    expect(cityFromPosition(lat, lng)).toBeNull();
  });

  it('rejects impossible coordinates', () => {
    expect(cityFromPosition(NaN, -80)).toBeNull();
    expect(cityFromPosition(95, -80)).toBeNull();
  });
});
