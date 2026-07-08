import { describe, expect, it } from 'vitest';

import { evaluateBudget } from '../scripts/perf-budget.mjs';

// Budget shape mirrors perf-budget.json (limits in KB).
const budget = {
  sharedFirstLoadJs: { limitKB: 180 },
  totalClientJs: { limitKB: 680 },
};

const KB = 1024;

describe('evaluateBudget (perf budget guard)', () => {
  it('passes when every metric is within budget', () => {
    const measured = { sharedFirstLoadJs: 160 * KB, totalClientJs: 600 * KB };
    const { pass, results } = evaluateBudget(measured, budget);
    expect(pass).toBe(true);
    expect(results.every(r => r.ok)).toBe(true);
  });

  it('fails and flags the offending metric when one is over budget', () => {
    const measured = { sharedFirstLoadJs: 200 * KB, totalClientJs: 600 * KB };
    const { pass, results } = evaluateBudget(measured, budget);
    expect(pass).toBe(false);
    expect(results.find(r => r.key === 'sharedFirstLoadJs')?.ok).toBe(false);
    expect(results.find(r => r.key === 'totalClientJs')?.ok).toBe(true);
  });

  it('treats a value exactly at the limit as within budget', () => {
    const measured = { sharedFirstLoadJs: 180 * KB, totalClientJs: 680 * KB };
    expect(evaluateBudget(measured, budget).pass).toBe(true);
  });

  it('ignores non-limit keys such as $comment', () => {
    const withComment = { $comment: 'note', ...budget };
    const measured = { sharedFirstLoadJs: 1, totalClientJs: 1 };
    const { results } = evaluateBudget(measured, withComment);
    expect(results.map(r => r.key)).toEqual(['sharedFirstLoadJs', 'totalClientJs']);
  });
});
