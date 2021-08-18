const esbuild = require('esbuild');
const assetsManifestPlugin = require('../index');
const outdir = './dist';

esbuild.build({
  entryPoints: ['./app.js'],
  outdir,
  bundle: true,
  metafile: true,
  entryNames: '[name]-[hash]',
  publicPath: '/static',
  plugins: [
    assetsManifestPlugin({
      filename: 'myapp-manifest.json',
      path: outdir
    })
  ],
  loader: {
    '.jpg': 'file'
  }
});
