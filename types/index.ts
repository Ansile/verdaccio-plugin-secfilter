import { Config } from '@verdaccio/types';
import { Range } from 'semver';

export type PackageBlockRule = { scope: string } | { package: string } | { package: string; versions: string };
export interface CustomConfig extends Config {
  dateThreshold?: string | number;
  block?: Array<PackageBlockRule>;
}

export type ParsedBlockKind = 'scope' | 'package' | undefined;

export type BlockStrategy = 'block' | 'replace';
interface ParsedBlockConfig {
  block: Range[];
  strategy?: BlockStrategy;
}

export type ParsedBlockRule = ParsedBlockConfig | ParsedBlockKind;
