import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['server/src/**/*.ts'],
      exclude: ['server/src/index.ts', 'server/src/**/types.ts'],
      reporter: ['text', 'html'],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 50,
      },
    },
  },
});
