# esbuild-plugin-assets-manifest

Generate manifest file like assets-webpack-plugin

## Usage

See [./test](https://github.com/indooorsman/esbuild-plugin-assets-manifest/tree/main/test) for example.

```bash
npm install -D esbuild-plugin-assets-manifest
```

```js
const assetsManifest = require('esbuild-plugin-assets-manifest');

esbuild.build({
  plugin: [
    assetsManifest({
      filename: `myapp-manifest.json`,
      path: `dist`
    })
  ]
})
```