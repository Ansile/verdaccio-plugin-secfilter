/* eslint-disable new-cap */
import { IPluginStorageFilter, Package, PluginOptions } from '@verdaccio/types';
import { Range, satisfies } from 'semver';

import { CustomConfig, PackageBlockRule, ParsedBlockRule } from '../types/index';

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

/**
 * Delete a tag if it maps to a forbidden version
 * todo: maybe verdaccio does this by itself, check later
 */
function cleanupTags(packageInfo: Package): void {
  Object.entries(packageInfo['dist-tags']).forEach(([tag, tagVersion]) => {
    if (!packageInfo.versions[tagVersion]) {
      delete packageInfo['dist-tags'][tag];
    }
  });
}

function getPackageClone(packageInfo: Readonly<Package>) {
  return {
    ...packageInfo,
    versions: {
      ...packageInfo.versions,
    },
    'dist-tags': {
      ...packageInfo['dist-tags'],
    },
  };
}

/**
 * filter out all package versions that were published after dateThreshold
 * @param packageInfo
 * @param dateThreshold
 */
function filterVersionsByPublishDate(packageInfo: Readonly<Package>, dateThreshold: Date) {
  const { versions, time, name } = packageInfo;

  if (!time) {
    throw new TypeError(`Time of publication was not provided for package ${name}`);
  }

  const newPackage = getPackageClone(packageInfo);

  const clearVersions: string[] = [];

  Object.keys(versions).forEach(version => {
    const publishTime = time[version];

    if (!publishTime) {
      throw new TypeError(`Time of publication was not provided for package ${name}, version ${version}`);
    }

    if (new Date(publishTime) > dateThreshold) {
      // clear untrusted version
      clearVersions.push(version);
    }
  });

  // delete version from versions
  clearVersions.forEach(version => {
    delete newPackage.versions[version];
  });

  cleanupTags(newPackage);

  return Promise.resolve(newPackage);
}

function isScopeRule(rule: PackageBlockRule): rule is { scope: string } {
  // eslint-disable-next-line no-prototype-builtins
  return 'scope' in rule && typeof rule.scope === 'string';
}

function isPackageRule(rule: PackageBlockRule): rule is { package: string; version: never } {
  // eslint-disable-next-line no-prototype-builtins
  return 'package' in rule && !('version' in rule);
}

function isPackageAndVersionRule(rule: PackageBlockRule): rule is { package: string; version: string } {
  // eslint-disable-next-line no-prototype-builtins
  return 'package' in rule && 'version' in rule;
}

/**
 * filter out all blocked package versions. If all package is blocked, or it's scope is blocked - block all versions.
 * @param packageInfo
 * @param block
 */
export function filterBlockedVersions(packageInfo: Readonly<Package>, block: Map<string, ParsedBlockRule>): Package {
  const { scope } = splitName(packageInfo.name);

  if (scope && block.get(scope) === 'scope') {
    return { ...packageInfo, versions: {}, readme: `All packages in scope ${scope} blocked by rule` };
  }

  const blockRule = block.get(packageInfo.name);

  if (!blockRule) {
    return packageInfo;
  }

  if (blockRule === 'package') {
    return { ...packageInfo, versions: {}, readme: `All package versions blocked by rule` };
  }

  const newPackageInfo = getPackageClone(packageInfo);

  const blockedVersionRanges = blockRule as Range[];

  Object.keys(newPackageInfo.versions).forEach(version => {
    blockedVersionRanges.forEach(versionRange => {
      if (satisfies(version, versionRange, { includePrerelease: true, loose: true })) {
        delete newPackageInfo.versions[version];
      }
    });
  });

  // Add debug info for devs
  newPackageInfo.readme =
    (newPackageInfo.readme || '') +
    `\nSome versions of package are blocked by rules: ${blockedVersionRanges.map(range => range.raw)}`;

  return newPackageInfo;
}

export default class VerdaccioMiddlewarePlugin implements IPluginStorageFilter<CustomConfig> {
  private readonly config: CustomConfig;
  private readonly parsedConfig: {
    dateThreshold: Date | null;
    block: Map<string, ParsedBlockRule>;
  };

  constructor(config: CustomConfig, options: PluginOptions<CustomConfig>) {
    this.config = config;

    const blockMap = (config.block ?? []).reduce((map, value) => {
      // eslint-disable-next-line no-prototype-builtins
      if (isScopeRule(value)) {
        if (!value.scope.startsWith('@')) {
          throw new TypeError(`Scope value must start with @, found: ${value.scope}`);
        }

        map.set(value.scope, 'scope');
        return map;
      }

      if (isPackageRule(value)) {
        map.set(value.package, 'package');
        return map;
      }

      if (isPackageAndVersionRule(value)) {
        const previousRanges = map.get(value.package) || [];

        if (typeof previousRanges === 'string') {
          return map; // use more strict rule
        }

        try {
          const range = new Range(value.version);

          map.set(value.package, [...previousRanges, range]);
        } catch (e) {
          options.logger.error('Error parsing rule failed:');
          options.logger.error(e);
          options.logger.error('encountered while parsing rule:');
          options.logger.error(value);
        }

        return map;
      }

      throw new TypeError(`Could not parse rule ${JSON.stringify(value, null, 4)} in skipChecksFor`);
    }, new Map<string, ParsedBlockRule>());

    const dateThreshold = config.dateThreshold ? new Date(config.dateThreshold) : null;

    // eslint-disable-next-line no-prototype-builtins
    if (dateThreshold && isNaN(dateThreshold.getTime())) {
      throw new TypeError(`Invalid date ${config.dateThreshold} were provided for dateThreshold`);
    }

    this.parsedConfig = {
      ...config,
      dateThreshold,
      block: blockMap,
    };

    options.logger.debug(
      `Loaded plugin-secfilter, ${JSON.stringify(this.parsedConfig, null, 4)}, ${Array.from(
        this.parsedConfig.block.entries()
      )}`
    );
  }

  filter_metadata(packageInfo: Readonly<Package>): Promise<Package> {
    const { dateThreshold, block } = this.parsedConfig;

    let newPackageInfo = packageInfo;
    if (block.size > 0) {
      newPackageInfo = filterBlockedVersions(packageInfo, block);
    }

    if (dateThreshold) {
      return filterVersionsByPublishDate(newPackageInfo, dateThreshold);
    }

    return Promise.resolve(packageInfo);
  }
}
