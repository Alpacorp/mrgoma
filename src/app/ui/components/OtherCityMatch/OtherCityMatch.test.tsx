import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VisitorCityProvider } from '@/app/context/VisitorCityContext';
import { writeGuess } from '@/app/utils/visitorCity';

import OtherCityMatch from './OtherCityMatch';

const fetchMock = vi.fn();
const answer = (body: unknown) => ({ ok: true, json: async () => body });

const renderIt = (tireCity: 'Miami' | 'Orlando' = 'Orlando') =>
  render(
    <VisitorCityProvider>
      <p>
        Located in {tireCity}
        <OtherCityMatch tireId="10" tireCity={tireCity} />
      </p>
    </VisitorCityProvider>
  );

const elsewhereCalls = () =>
  fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/tire-sets/elsewhere'));

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('OtherCityMatch', () => {
  it('links to the closest match in the visitor’s city (AC4, AC12)', async () => {
    writeGuess('Miami', 'location-1');
    fetchMock.mockResolvedValue(answer({ count: 3, href: '/tires/7-michelin-225-65-17' }));
    renderIt();
    const link = await screen.findByRole('link', { name: '3 like this in Miami →' });
    expect(link).toHaveAttribute('href', '/tires/7-michelin-225-65-17');
    expect(link).toHaveAttribute('data-track', 'city_match_open');
    expect(link).toHaveAttribute('data-track-label', 'Miami');
    expect(elsewhereCalls()[0][0]).toBe('/api/tire-sets/elsewhere?id=10&city=Miami');
  });

  it('shows 60+ at the query cap', async () => {
    writeGuess('Miami', 'location-1');
    fetchMock.mockResolvedValue(answer({ count: 60, href: '/tires/7-x' }));
    renderIt();
    expect(await screen.findByRole('link', { name: '60+ like this in Miami →' })).toBeVisible();
  });

  it('says nothing with no match or an error (AC5)', async () => {
    writeGuess('Miami', 'location-1');
    fetchMock.mockResolvedValueOnce(answer({ count: 0 }));
    const { unmount } = renderIt();
    await waitFor(() => expect(elsewhereCalls()).toHaveLength(1));
    expect(screen.queryByRole('link')).toBeNull();
    unmount();
    fetchMock.mockRejectedValueOnce(new Error('down'));
    renderIt();
    await waitFor(() => expect(elsewhereCalls()).toHaveLength(2));
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('never asks for a tire in the visitor’s own city or without a city (AC2)', async () => {
    writeGuess('Orlando', 'location-6');
    const { unmount } = renderIt('Orlando');
    await new Promise(r => setTimeout(r, 0));
    unmount();
    writeGuess(null, null);
    renderIt('Orlando');
    await new Promise(r => setTimeout(r, 0));
    expect(elsewhereCalls()).toHaveLength(0);
  });
});
