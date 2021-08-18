# esbuild-plugin-assets-manifest

Generate manifest file like assets-webpack-plugin

## Usage

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