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

```json
// myapp-manifest.json
{
  "": {
    "app.js": "/static/app-PUTTQJMG.js",
    "world.jpg": "/static/world-7U6P4ADE.jpg",
    "app.css": "/static/app-5T3MG3RU.css"
  },
  "app": {
    "js": "/static/app-PUTTQJMG.js",
    "css": "/static/app-5T3MG3RU.css"
  },
  "world": {
    "jpg": "/static/world-7U6P4ADE.jpg"
  }
}
```