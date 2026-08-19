import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

/**
 * Two columns, two meanings, and until `026` the dashboard showed only one of
 * them — under the other one's name.
 *
 * `VaultName` is the store. `Location` is the shelf code inside that store, and
 * it was already arriving on every row: the list query is `SELECT *` and the
 * recordset is cast rather than projected, so the value crossed the wire and was
 * simply never rendered.
 */

const ROW = {
  TireId: '475168',
  Code: '262081',
  Brand: 'CONTINENTAL',
  Model2: 'SPORTCONTACT 7',
  RealSize: '325/35/20',
  VaultName: 'Hialeah',
  Location: '+703C+',
  Price: 465,
};

function mockRows(records: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records, totalCount: records.length }),
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the dashboard table tells a store from a shelf', () => {
  it('heads the store column Store and the shelf column Location', async () => {
    mockRows([ROW]);
    const { default: DashboardTable } = await import('./DashboardTable');
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0);
    });

    // Sortable headings carry a `↕` affordance, so compare on the label itself.
    const headings = screen
      .getAllByRole('columnheader')
      .map(th => th.textContent?.replace(/[^A-Za-z ]/g, '').trim());

    expect(headings).toContain('Store');
    expect(headings).toContain('Location');
  });

  // AC2 — the value under each heading is the field that heading names.
  it('shows the store under Store and the shelf code under Location', async () => {
    mockRows([ROW]);
    const { default: DashboardTable } = await import('./DashboardTable');
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Hialeah')).toBeInTheDocument();
    });
    expect(screen.getByText('+703C+')).toBeInTheDocument();
  });

  // 1.057 units carry no shelf code. The cell must be empty, not `undefined`.
  it('renders nothing rather than a placeholder when a tire has no shelf code', async () => {
    mockRows([{ ...ROW, Location: '' }]);
    const { default: DashboardTable } = await import('./DashboardTable');
    render(<DashboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Hialeah')).toBeInTheDocument();
    });
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    expect(screen.queryByText('+703C+')).not.toBeInTheDocument();
  });
});
