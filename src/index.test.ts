import { Package, Version, Logger } from '@verdaccio/types';

import * as semver from 'semver';
import { ParsedBlockRule } from '../types';

import { filterBlockedVersions } from './index';

const exampleVersion: Version = {
  _id: '',
  main: '',
  name: '',
  readme: '',
  version: '',
} as any;

const examplePackage: Package = {
  'dist-tags': { latest: '3.0.0' },
  _attachments: {},
  _distfiles: {},
  _rev: '',
  _uplinks: {},
  name: '@babel/test',
  versions: {
    '1.0.0': exampleVersion,
    '3.0.0': exampleVersion,
  },
};


const noop = () => {};
const logger: Logger = {
  child: noop,
  debug: noop,
  error: noop,
  http: noop,
  warn: noop,
  info: noop,
  trace: noop,
};

describe('filters blocked packages', () => {
  test('filters when rules are for scope', () => {
    const block = new Map<string, ParsedBlockRule>([['@babel', 'scope']]);

    expect(filterBlockedVersions(examplePackage, block, logger)).toMatchSnapshot();
  });

  test('filters when rules are for package', () => {
    const block = new Map<string, ParsedBlockRule>([['@babel/test', 'package']]);

    expect(filterBlockedVersions(examplePackage, block, logger)).toMatchSnapshot();
  });

  test('filters when rules are for versions', () => {
    const block = new Map<string, ParsedBlockRule>([['@babel/test', { block: [new semver.Range('>1.0.0')] }]]);

    expect(filterBlockedVersions(examplePackage, block, logger)).toMatchSnapshot();
  });

  test('filters when multiple rules are for versions', () => {
    const block = new Map<string, ParsedBlockRule>([
      ['@babel/test', { block: [new semver.Range('>1.0.0'), new semver.Range('<=1.0.0')] }],
    ]);

    expect(filterBlockedVersions(examplePackage, block, logger)).toMatchSnapshot();
  });
});
