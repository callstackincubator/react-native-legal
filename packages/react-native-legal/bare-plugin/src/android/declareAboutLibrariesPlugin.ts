import fs from 'node:fs';
import path from 'node:path';

import { declareAboutLibrariesPluginUtil } from '../../../plugin-utils/build/android';

import { modifyFileContent } from './utils';

/**
 * Modifies root build.gradle with a declaration for AboutLibraries Gradle plugin
 *
 * NOTE: As of now, it doesn't support build.gradle.kts (Gradle Kotlin Script)
 */
export function declareAboutLibrariesPlugin(androidProjectPath: string) {
  if (fs.existsSync(path.join(androidProjectPath, 'build.gradle.kts'))) {
    console.warn('Gradle Kotlin scripts are not supported yet');
  } else if (fs.existsSync(path.join(androidProjectPath, 'build.gradle'))) {
    modifyFileContent(path.join(androidProjectPath, 'build.gradle'), declareAboutLibrariesPluginUtil);
  } else {
    console.warn('Cannot find build.gradle file');
  }
}
