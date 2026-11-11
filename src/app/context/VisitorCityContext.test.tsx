import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { writeGuess } from '@/app/utils/visitorCity';

import { useVisitorCity, VisitorCityProvider } from './VisitorCityContext';

const fetchMock = vi.fn();

const Probe = () => {
  const v = useVisitorCity();
  return <p data-testid="city">{`${v.status}:${v.city ?? 'none'}:${v.nearestStoreId ?? '-'}`}</p>;
};

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ city: 'Miami', nearestStoreId: 'location-5' }),
  });
  vi.stubGlobal('fetch', fetchMock);
});

describe('VisitorCityProvider', () => {
  it('does nothing until a component asks (most pages never call the API)', () => {
    render(
      <VisitorCityProvider>
        <p>page</p>
      </VisitorCityProvider>
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('asks the API once and remembers the estimate (AC1)', async () => {
    render(
      <VisitorCityProvider>
        <Probe />
        <Probe />
      </VisitorCityProvider>
    );
    await waitFor(() =>
      expect(screen.getAllByTestId('city')[0].textContent).toBe('ready:Miami:location-5')
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/visitor-city');
  });

  it('uses a stored estimate without calling the API', async () => {
    writeGuess('Orlando', 'location-6');
    render(
      <VisitorCityProvider>
        <Probe />
      </VisitorCityProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('city').textContent).toBe('ready:Orlando:location-6')
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falls back to no city when the API fails (AC13)', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    render(
      <VisitorCityProvider>
        <Probe />
      </VisitorCityProvider>
    );
    await waitFor(() => expect(screen.getByTestId('city').textContent).toBe('ready:none:-'));
  });
});
