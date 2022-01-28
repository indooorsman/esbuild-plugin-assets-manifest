const { writeFileSync } = require('fs');
const path = require('path');

const getEntryPathname = ({ entryPoint, inputs }) => {
  const sourcePath = entryPoint || Object.keys(inputs)[0];
  const ext = path.extname(sourcePath);
  const basename = path.basename(sourcePath, ext);
  const dir = path.dirname(sourcePath);
  const m = basename.match(/(.+)-[0-9A-Z]{8}$/);
  if (m && m[1]) {
    return path.join(dir, m[1] + ext);
  }
  return path.join(dir, basename + ext);
};

const buildEntryPointsMap = (metaOutputs, inputEntryPoints) => {
  const reversed = {};
  for (const pointName in inputEntryPoints) {
    reversed[inputEntryPoints[pointName]] = pointName;
  }
  const getEntryPoint = (p) => {
    const k = Object.keys(reversed).find((k) => {
      return k.endsWith(p);
    });
    return reversed[k];
  };

  const map = {};
  Object.keys(metaOutputs).forEach((k) => {
    const { entryPoint, inputs } = metaOutputs[k];
    if (entryPoint && Object.keys(inputs).length) {
      Object.keys(inputs).forEach((f) => {
        map[f] = getEntryPoint(entryPoint);
      });
    }
  });

  return map;
};

const groupByName = (manifest) => {
  const r = {};
  Object.keys(manifest).forEach((k) => {
    const v = manifest[k];
    const resolvedPath = v.outpath;
    const entryPoint = v.entryPoint;
    const ext = path.extname(k);
    const extNoDot = ext.replace(/^\./, '');
    if (entryPoint) {
      r[entryPoint] = r[entryPoint] || {};
      r[entryPoint][extNoDot] = resolvedPath;
    } else {
      r[''] = r[''] || {};
      r[''][extNoDot] = r[''][extNoDot] || [];
      r[''][extNoDot].push(resolvedPath);
    }
  });
  return r;
};

/**
 * assetsManifestPlugin
 * @param {import('./index').Options} opt
 * @returns {import('esbuild').Plugin}
 */
function assetsManifestPlugin(opt) {
  return {
    name: 'esbuild-plugin-assets-manifest',
    setup(build) {
      if (Array.isArray(build.initialOptions.entryPoints)) {
        console.error(
          '[esbuild-plugin-assets-manifest] Error: entryPoints must be object (https://esbuild.github.io/api/#entry-points) to generate manifest'
        );
        return;
      }

      build.initialOptions.metafile = true;

      build.onEnd((result) => {
        if (!result.metafile) {
          return;
        }

        const outputs = result.metafile.outputs;
        if (!outputs) {
          return;
        }

        const {
          publicPath,
          outdir,
          entryPoints,
          absWorkingDir = process.cwd()
        } = build.initialOptions;

        const fullOutdir = path.resolve(absWorkingDir, opt.path || outdir);
        const relativeOutdir = path.relative(absWorkingDir, fullOutdir);

        const manifest = {};

        const entryPointsMap = buildEntryPointsMap(outputs, entryPoints);

        Object.keys(outputs).forEach((outFilePath) => {
          const entryPathname = getEntryPathname(outputs[outFilePath]);
          manifest[entryPathname] = manifest[entryPathname] || {};
          const outpath = publicPath
            ? outFilePath.replace(relativeOutdir, publicPath)
            : outFilePath;
          manifest[entryPathname] = { outpath, entryPoint: entryPointsMap[entryPathname] };
        });

        const finalManifest = groupByName(manifest);

        writeFileSync(
          path.resolve(fullOutdir, opt.filename),
          JSON.stringify(finalManifest, null, '  '),
          { encoding: 'utf-8' }
        );
      });
    }
  };
}

module.exports = assetsManifestPlugin;
