const esbuild = require('esbuild');
const assetsManifestPlugin = require('../index.js');
const outdir = './dist';

esbuild.build({
  entryPoints: {
    app: './index.js',
    aucss: './app/a/u.css',
    bu: './app/b/u.js'
  },
  outdir,
  bundle: true,
  metafile: true,
  minify: true,
  target: 'esnext',
  entryNames: '[name]-[hash]',
  publicPath: '/static',
  plugins: [
    assetsManifestPlugin({
      filename: 'myapp-manifest.json',
      path: outdir,
      metadata: { timestamp: new Date(), module: 'myapp', type: 'esm' },
      processOutput(assets) {
        const orderAssets = {
          app: assets['app'],
          aucss: assets['aucss'],
          bu: assets['bu'],
          ...assets
        };
        return JSON.stringify(orderAssets, null, '  ');
      }
    })
  ],
  absWorkingDir: __dirname,
  loader: {
    '.jpg': 'file'
  }
});
