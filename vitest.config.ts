import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // jsdom so component/hook tests have a DOM; pure utils run fine here too.
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/app/utils/**',
        'src/app/hooks/**',
        'src/app/api/tire/**',
        'src/app/api/ranges/**',
        'src/app/ui/components/BrandHeadline/**',
        'src/app/ui/components/Dialog/**',
        'src/app/ui/components/HamburgerMenu/**',
        'src/app/ui/components/ProductImage/**',
        'src/app/ui/components/SelectDropdown/**',
        'src/app/ui/components/WhatsAppButton/**',
        'src/app/ui/sections/CartModal/**',
        'src/app/ui/sections/TireCard/**',
      ],
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
      // Safety net against big regressions; we currently sit comfortably above.
      thresholds: {
        statements: 55,
        branches: 55,
        functions: 55,
        lines: 55,
      },
    },
  },
});
