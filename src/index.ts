/* eslint-disable new-cap */
import { IPluginStorageFilter, Package, PluginOptions } from '@verdaccio/types';

import { CustomConfig } from '../types/index';

/**
 * Split a package name into name itself and scope
 * @param name
 */
function splitName(name: string) {
  const parts = name.split('/');

  if (parts.length > 1) {
    return {
      scope: parts[0],
      name: parts[1],
    };
  } else {
    return {
      name: parts[0],
    };
  }
}

export default class VerdaccioMiddlewarePlugin implements IPluginStorageFilter<CustomConfig> {
  private readonly config: CustomConfig;
  private readonly parsedConfig: {
    dateThreshold: Date;
    skipChecksFor: Map<string, 'package' | 'scope' | undefined>;
  };

  constructor(config: CustomConfig, options: PluginOptions<CustomConfig>) {
    this.config = config;

    const skipMap = config.skipChecksFor.reduce((map, value) => {
      if (typeof value === 'string') {
        map.set(value, 'package');
        return map;
      }

      if (typeof value === 'object' && typeof value.scope === 'string') {
        if (!value.scope.startsWith('@')) {
          throw new TypeError(`Scope value must start with @, found: ${value.scope}`)
        }

        map.set(value, 'scope');
        return map;
      }

      throw new TypeError(`Could not parse rule ${JSON.stringify(value, null, 4)} in skipChecksFor`);
    }, new Map());

    this.parsedConfig = {
      ...config,
      skipChecksFor: skipMap,
      dateThreshold: new Date(config.dateThreshold),
    };

    options.logger.debug(
      `Loaded plugin-secfilter, ${JSON.stringify(this.parsedConfig, null, 4)}, ${Array.from(
        this.parsedConfig.skipChecksFor.entries()
      )}`
    );
  }

  filter_metadata(packageInfo: Package): Promise<Package> {
    const { versions, time, name } = packageInfo;
    const { dateThreshold, skipChecksFor } = this.parsedConfig;

    const { scope } = splitName(name);

    if (scope && skipChecksFor.get(scope) === 'scope') {
      // package is in checked scope, it's all good
      return Promise.resolve(packageInfo);
    }

    if (skipChecksFor.get(name) === 'package') {
      // package is a-ok
      return Promise.resolve(packageInfo);
    }

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
