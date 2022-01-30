import type { Plugin } from 'esbuild';

declare namespace ESBuildPluginAssetsManifest {
  interface Assets {
    [name: string]: {
      [ext: string]: string;
    };
  }

  type ProcessOutputFn = (assets: Assets) => string;

  interface Options {
    /**
     * required. the name of manifest file
     */
    filename: string;
    /**
     * optional. default is `outdir` of esbuild config
     */
    path?: string;
    /**
     * optional. will be appended to the manifest json
     */
    metadata?: Record<string, unknown>;
    /**
     * optional. return value of this function will overwrite the manifest json file
     */
    processOutput?: ProcessOutputFn;
  }
}

export type Assets = ESBuildPluginAssetsManifest.Assets;

export type Options = ESBuildPluginAssetsManifest.Options;

export default function assetsManifestPlugin(options: ESBuildPluginAssetsManifest.Options): Plugin;

export = assetsManifestPlugin;
