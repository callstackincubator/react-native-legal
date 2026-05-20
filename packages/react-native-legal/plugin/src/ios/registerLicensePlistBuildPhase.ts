import type { ExpoConfig } from 'expo/config';
import { IOSConfig, withXcodeProject } from 'expo/config-plugins';

import { registerLicensePlistBuildPhaseUtil } from '../../../plugin-utils/build/ios';
import type { LicensePlistOptions } from '../../../plugin-utils/build/types';

/**
 * Registers a shell script that invokes generation of license metadata with LicensePlist
 *
 * It looks for the first application native target (Expo projects will only have single native target)
 * for which it creates & links a shell script build phase responsible for iOS native deps license metadata
 */
export function registerLicensePlistBuildPhase(config: ExpoConfig, options?: LicensePlistOptions): ExpoConfig {
  return withXcodeProject(config, (exportedConfig) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(exportedConfig.modRequest.projectRoot);
    const projectTargetId = IOSConfig.XcodeUtils.getApplicationNativeTarget({
      project: exportedConfig.modResults,
      projectName,
    }).uuid;

    exportedConfig.modResults = registerLicensePlistBuildPhaseUtil(projectTargetId, exportedConfig.modResults, options);

    return exportedConfig;
  });
}
