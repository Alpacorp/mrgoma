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
        'src/app/api/instant-quote/**',
        'src/app/**/InstantQoute/**',
        'src/app/ui/components/BrandHeadline/**',
        'src/app/ui/components/Dialog/**',
        'src/app/ui/components/HamburgerMenu/**',
        'src/app/ui/components/ProductImage/**',
        'src/app/ui/components/SelectDropdown/**',
        'src/app/ui/sections/CartModal/**',
        'src/app/ui/sections/TireCard/**',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        // Infra that isn't a meaningful unit-test target (integration/E2E instead).
        'src/app/utils/authOptions.ts', // NextAuth provider config
        'src/app/utils/parseText.tsx', // markdown→JSX parser
        'src/app/hooks/useTireDimensions.ts', // context + effect heavy
        'src/app/hooks/useTireSizeWithContext.ts',
      ],
      // Safety net against big regressions; we currently sit comfortably above.
      thresholds: {
        statements: 80,
        branches: 72,
        functions: 80,
        lines: 80,
      },
    },
  },
});
