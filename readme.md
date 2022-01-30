# esbuild-plugin-assets-manifest

[![npm version](https://img.shields.io/npm/v/esbuild-plugin-assets-manifest.svg?style=flat)](https://www.npmjs.com/package/esbuild-plugin-assets-manifest)

Generate manifest file like [assets-webpack-plugin](https://github.com/ztoben/assets-webpack-plugin)

## Usage

See [./test](https://github.com/indooorsman/esbuild-plugin-assets-manifest/tree/main/test) for example.

```bash
npm install -D esbuild-plugin-assets-manifest
```

```js
const assetsManifest = require('esbuild-plugin-assets-manifest');

esbuild.build({
  outdir: './dist',
  target: 'esnext',
  entryNames: '[name]-[hash]',
  publicPath: '/static',
  bundle: true,
  metafile: true,
  plugins: [
    assetsManifest({
      filename: 'myapp-manifest.json',
      path: './dist',
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
  ]
});
```

### Configuration

See [index.d.ts](https://github.com/indooorsman/esbuild-plugin-assets-manifest/tree/main/index.d.ts)

### Output

```js
// myapp-manifest.json
{
  "app": {
    "js": "/static/app-VYODTBBJ.js",
    "css": "/static/app-GXI4CST6.css"
  },
  "": {
    "jpg": [
      "/static/world-7U6P4ADE.jpg"
    ]
  },
  "metadata": {
    "timestamp": "2022-01-30T03:45:07.655Z",
    "module": "myapp",
    "type": "esm"
  }
}
```
