const isProd = process.env.NODE_ENV === 'production';

require('esbuild').build({
  entryPoints: ['src/index.js'],
  bundle: true,
  watch: !isProd,
  minify: isProd,

  ...(isProd
    ? {
        outdir: 'dist',
      }
    : {
        outfile: 'index.js',
      }),
});
