import { Config } from '@verdaccio/types';
import { Range } from 'semver';

export type PackageBlockRule = { scope: string } | { package: string } | { package: string; version: string };
export interface CustomConfig extends Config {
  dateThreshold?: string | number;
  block?: Array<PackageBlockRule>;
}

export type ParsedBlockRule = Range[] | 'scope' | 'package' | undefined;
