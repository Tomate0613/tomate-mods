import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  dts: { resolve: true },
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
});
