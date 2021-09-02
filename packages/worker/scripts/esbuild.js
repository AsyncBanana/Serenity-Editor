import { build } from 'esbuild'

build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/worker.js',
  bundle: true,
  format: 'esm',
  minify: true,
  target: ['chrome92'],
  // eslint-disable-next-line no-undef
  define: {
    'process.NODE_ENV': 'production',
  },
})
