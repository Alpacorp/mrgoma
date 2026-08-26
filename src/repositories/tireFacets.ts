import { getPool } from '@/connection/db';
import { logQuery } from '@/connection/queryLogger';
import {
  activeGroups,
  buildFacetQuery,
  mapFacetRows,
  mergeGroupFacets,
  omitGroup,
  type RequestFacets,
  type TireFacets,
} from '@/repositories/facetQuery';
import type { TireFilters } from '@/repositories/filtersClause';

/**
 * The I/O half. Everything that can be reasoned about without a database —
 * building the query and reading its rows — lives in `facetQuery.ts`, so it can
 * be tested; this file only runs it. Same split as `feedQuery` / the feed fetch.
 */
export async function fetchTireFacets(filters: TireFilters = {}): Promise<TireFacets> {
  const pool = await getPool();
  const request = pool.request();

  const { query, params } = buildFacetQuery(filters);
  for (const p of params) request.input(p.name, p.type, p.value);

  const result = await logQuery('tires.facets', () => request.query(query));
  return mapFacetRows((result.recordset ?? []) as Parameters<typeof mapFacetRows>[0]);
}

/**
 * Every count the rail needs, in as few round trips as the semantics allow:
 * one query for the groups with no filter of their own, plus one per **active**
 * group with that group's own filter lifted. Typically one to three, never nine.
 *
 * They run together rather than in sequence. Measured against the live database
 * from a laptop over the internet, three facet queries and the results query in
 * parallel settled at **330 ms wall clock** — less than a single cold one, because
 * they overlap instead of queueing. The page pays the slowest, not the sum.
 */
export async function fetchFacetsForRequest(filters: TireFilters = {}): Promise<RequestFacets> {
  const groups = activeGroups(filters);

  const [base, ...perGroup] = await Promise.all([
    fetchTireFacets(filters),
    ...groups.map(group =>
      fetchTireFacets(omitGroup(filters, group)).then(facets => ({ group, facets }))
    ),
  ]);

  return mergeGroupFacets(base as TireFacets, perGroup as { group: never; facets: TireFacets }[]);
}
