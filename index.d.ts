import type { Plugin } from 'esbuild';

declare namespace ESBuildPluginAssetsManifest {
  interface Assets {
    [name: string]: {
      [ext: string]: string;
    };
  }

  type ProcessOutputFn = (assets: Assets) => string;

  interface Options {
    filename: string;
    path: string;
    metadata?: Record<string, unknown>;
    processOutput?: ProcessOutputFn
  }
}

export type Assets = ESBuildPluginAssetsManifest.Assets;

export type Options = ESBuildPluginAssetsManifest.Options;

export default function assetsManifestPlugin(options: ESBuildPluginAssetsManifest.Options): Plugin;

export = assetsManifestPlugin;
