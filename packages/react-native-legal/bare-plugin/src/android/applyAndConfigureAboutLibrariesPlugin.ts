import fs from 'node:fs';
import path from 'node:path';

import { applyAndConfigureAboutLibrariesPluginUtil } from '../../../plugin-utils/build/android';

import { modifyFileContent } from './utils';

/**
 * Modifies application's build.gradle with AboutLibraries plugin
 *
 * NOTE: As of now, it doesn't support build.gradle.kts (Gradle Kotlin Script)
 */
export function applyAndConfigureAboutLibrariesPlugin(androidProjectPath: string) {
  if (fs.existsSync(path.join(androidProjectPath, 'app', 'build.gradle.kts'))) {
    console.warn('Gradle Kotlin scripts are not supported yet');
  } else if (fs.existsSync(path.join(androidProjectPath, 'app', 'build.gradle'))) {
    modifyFileContent(path.join(androidProjectPath, 'app', 'build.gradle'), applyAndConfigureAboutLibrariesPluginUtil);
  } else {
    console.warn('Cannot find app/build.gradle file');
  }
}
