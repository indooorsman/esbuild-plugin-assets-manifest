const { writeFileSync } = require('fs');
const path = require('path');

const getEntryPathname = ({ entryPoint, inputs = {} }, outFilePath = '') => {
  const inputPathes = Object.keys(inputs);
  if (inputPathes.length > 1 && !entryPoint && !outFilePath.endsWith('.css')) {
    // maybe it's a splitted common js chunk
    return outFilePath;
  }

  const firstInput = inputPathes[0] || '';
  const sourcePath = entryPoint || (/^<define:.+>$/i.test(firstInput) ? outFilePath : firstInput);
  if (!sourcePath) {
    return;
  }
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
 * resolveExts
 * @param {import('./index').Assets} finalManifest
 * @returns {import('./index').Assets}
 */
const resolveExts = (finalManifest) => {
  const resolved = {};
  for (const entryPoint in finalManifest) {
    resolved[entryPoint] = {};
    const exts = finalManifest[entryPoint];
    for (const ext in exts) {
      let outpath = exts[ext];
      if (Array.isArray(outpath)) {
        outpath = outpath[0];
      }
      const outExt = path.extname(outpath).replace(/^\./, '');
      resolved[entryPoint][outExt] = exts[ext];
    }
  }
  return resolved;
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
          const entryPathname = getEntryPathname(
            outputs[outFilePath],
            outFilePath.replace('' + publicPath, '')
          );
          if (!entryPathname) {
            return;
          }
          manifest[entryPathname] = manifest[entryPathname] || {};
          const outpath = publicPath
            ? outFilePath.replace(relativeOutdir, publicPath)
            : outFilePath;
          manifest[entryPathname] = { outpath, entryPoint: entryPointsMap[entryPathname] };
        });

        const finalManifest = resolveExts(groupByName(manifest));
        const { metadata, processOutput } = opt;
        if (metadata) {
          finalManifest.metadata = metadata;
        }
        let manifestString = JSON.stringify(finalManifest, null, '  ');
        if (typeof processOutput === 'function') {
          manifestString = processOutput(finalManifest) || manifestString;
        }

        writeFileSync(path.resolve(fullOutdir, opt.filename), manifestString, {
          encoding: 'utf-8'
        });
      });
    }
  };
}

module.exports = assetsManifestPlugin;
