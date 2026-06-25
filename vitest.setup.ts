import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom doesn't implement scrollIntoView; stub it so components that call it
// (focus/feedback banners) don't throw during tests.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Unmount React trees after every test so the DOM doesn't leak between cases.
afterEach(() => {
  cleanup();
});
