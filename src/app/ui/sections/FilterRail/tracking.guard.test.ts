import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/**
 * `tech-stack.md`: user actions are instrumented **declaratively** with
 * `data-track`, and one delegated listener routes every one of them to both
 * sinks. There is no per-platform wiring to remember — only the attribute, which
 * is exactly the kind of thing that gets left off a new control and noticed a
 * quarter later when someone asks whether anyone uses the filters.
 */

const CONTROLS: [file: string, expected: string[]][] = [
  ['src/app/ui/sections/FilterRail/FacetGroup.tsx', ['filter_apply']],
  ['src/app/ui/sections/FilterRail/SearchableFacet.tsx', ['filter_apply']],
  ['src/app/ui/sections/FilterRail/RangeFacet.tsx', ['filter_apply']],
  ['src/app/ui/sections/FilterRail/AppliedFilters.tsx', ['filter_remove']],
  // Clear all lives in the rail's header — it was in both, and the page
  // showed the same control twice.
  ['src/app/ui/sections/FilterRail/FilterRail.tsx', ['filter_clear_all']],
  ['src/app/ui/sections/FilterRail/FilterRailMobile.tsx', ['filter_panel_toggle']],
  ['src/app/ui/components/ViewToggle/ViewToggle.tsx', ['results_view']],
  ['src/app/ui/components/NotResultsFound/NoResultsFound.tsx', ['filter_loosen']],
];

describe('every new control reports what happened', () => {
  it.each(CONTROLS)('%s', (file, expected) => {
    const source = readFileSync(file, 'utf8');
    for (const event of expected) {
      expect(source).toContain(`data-track="${event}"`);
    }
    expect(source).toContain('data-track-category="tires_filter"');
  });

  /**
   * Values are sent verbatim to two third parties. A brand or a rim size is a
   * fact about the catalogue; nothing here may carry anything about a person.
   */
  it('and never labels an event with anything personal', () => {
    for (const [file] of CONTROLS) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/data-track-label=\{[^}]*(email|phone|name|address|customer)/i);
    }
  });
});
