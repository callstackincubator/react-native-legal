import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface License {
  licenseContent: string;
  /**
   * @platform Android
   */
  name?: string;
  /**
   * @platform Android
   */
  url?: string;
  /**
   * @platform Android
   */
  year?: string;
}

export interface Library {
  id: string;
  name: string;
  licenses: License[];
  version?: string;
  /**
   * @platform Android
   */
  description?: string;
  /**
   * @platform Android
   */
  developers?: string;
  /**
   * @platform Android
   */
  website?: string;
  /**
   * @platform Android
   */
  organization?: string;
}

export interface LibrariesResult {
  data: Library[];
}

export interface Spec extends TurboModule {
  getLibrariesAsync(): Promise<LibrariesResult>;
  launchLicenseListScreen(licenseHeaderText: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeLegalModule');
