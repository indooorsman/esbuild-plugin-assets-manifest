/**
 * @typedef {object} options
 * @property {string} filename
 * @property {string} path
 */

const { writeFileSync } = require('fs');
const path = require('path');

const getEntryName = (filename) => {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const m = basename.match(/(.+)-[0-9A-Z]{8}$/);
  if (m && m[1]) {
    return m[1] + ext;
  }
  return basename + ext;
};

const groupByName = (manifest) => {
  const r = { '': { ...manifest } };
  Object.keys(manifest).forEach((k) => {
    const v = manifest[k];
    const ext = path.extname(k);
    const name = path.basename(k, ext);
    r[name] = r[name] || {};
    r[name][ext.replace(/^\./, '')] = v;
  });
  return r;
};

/**
 * assetsManifestPlugin
 * @param {options} opt
 * @returns {import('esbuild').Plugin}
 */
function assetsManifestPlugin(opt) {
  return {
    name: 'esbuild-plugin-assets-manifest',
    setup(build) {
      build.onEnd((result) => {
        if (!result.metafile) {
          return;
        }
        const outputs = result.metafile.outputs;
        if (!outputs) {
          return;
        }

        const { publicPath, outdir } = build.initialOptions;
        const fullOutdir = path.resolve(process.cwd(), opt.path || outdir);
        const relativeOutdir = path.relative(process.cwd(), fullOutdir);

        const manifest = {};

        Object.keys(outputs).forEach((name) => {
          const entryName = getEntryName(name);
          manifest[entryName] = manifest[entryName] || {};
          const outpath = publicPath ? name.replace(relativeOutdir, publicPath) : name;
          manifest[entryName] = outpath;
        });

        writeFileSync(
          path.resolve(fullOutdir, opt.filename),
          JSON.stringify(groupByName(manifest), null, '  '),
          { encoding: 'utf-8' }
        );
      });
    }
  };
}

module.exports = assetsManifestPlugin;
