import type { KeyboardEvent } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { handleKeyPress } from './handleKeyPress';

const press = (k: string) => {
  const preventDefault = vi.fn();
  const e = { key: k, preventDefault } as unknown as KeyboardEvent<HTMLInputElement>;
  return { e, preventDefault };
};

describe('handleKeyPress', () => {
  it('allows digits, slash and Backspace', () => {
    for (const k of ['0', '9', '/', 'Backspace']) {
      const { e, preventDefault } = press(k);
      handleKeyPress(e);
      expect(preventDefault).not.toHaveBeenCalled();
    }
  });

  it('blocks any other key', () => {
    for (const k of ['a', '-', ' ']) {
      const { e, preventDefault } = press(k);
      handleKeyPress(e);
      expect(preventDefault).toHaveBeenCalled();
    }
  });
});
