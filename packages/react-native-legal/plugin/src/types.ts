import type { PluginLicensesScanner, PluginScanOptions } from '../../plugin-utils/build/types';

export type PluginOptions = PluginScanOptions;

export type PlatformPluginOptions = {
  scanLicenses: PluginLicensesScanner;
};
