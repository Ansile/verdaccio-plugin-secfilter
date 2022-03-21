/* eslint-disable new-cap */
import { IPluginStorageFilter, Package, PluginOptions } from '@verdaccio/types';

import { CustomConfig } from '../types/index';

export default class VerdaccioMiddlewarePlugin implements IPluginStorageFilter<CustomConfig> {
  private readonly config: CustomConfig;

  constructor(config: CustomConfig, options: PluginOptions<CustomConfig>) {
    this.config = config;
    options.logger.debug(`Loaded plugin-secfilter, ${JSON.stringify(config)}`);
  }

  filter_metadata(packageInfo: Package): Promise<Package> {
    const { versions, time } = packageInfo;
    const dateThreshold = new Date(this.config.dateThreshold);

    if (!time) {
      throw new TypeError('Time of publication was not provided for package');
    }

    const newPackage = {
      ...packageInfo,
      versions: {
        ...packageInfo.versions,
      },
      'dist-tags': {
        ...packageInfo['dist-tags'],
      },
    };

    const clearVersions: string[] = [];

    Object.keys(versions).forEach(version => {
      const publishTime = time[version];

      if (!publishTime) {
        throw new TypeError(`Time of publication was not provided for package version ${version}`);
      }

      if (new Date(publishTime) > dateThreshold) {
        // clear untrusted version
        clearVersions.push(version);
      }
    });

    const clearVersionsSet = new Set(clearVersions);

    // delete version from versions
    clearVersions.forEach(version => {
      delete newPackage.versions[version];
    });

    // delete a tag if it maps to a forbidden version
    Object.entries(newPackage['dist-tags']).forEach(([tag, tagVersion]) => {
      if (clearVersionsSet.has(tagVersion)) {
        delete newPackage['dist-tags'][tag];
      }
    });

    return Promise.resolve(newPackage);
  }
}
