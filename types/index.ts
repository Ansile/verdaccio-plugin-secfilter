import { Config } from '@verdaccio/types';

type PackageSkipRule = string | { scope: string };
export interface CustomConfig extends Config {
  dateThreshold: string | number;
  skipChecksFor?: Array<PackageSkipRule>;
}
