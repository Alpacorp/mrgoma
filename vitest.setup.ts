import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount React trees after every test so the DOM doesn't leak between cases.
afterEach(() => {
  cleanup();
});
