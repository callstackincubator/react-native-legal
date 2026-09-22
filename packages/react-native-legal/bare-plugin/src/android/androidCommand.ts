import fs from 'node:fs';
import path from 'node:path';

import { writeAboutLibrariesNPMOutput } from '@callstack/licenses';

import type { PluginLicensesScanner } from '../../../plugin-utils/build/types';

import { addListActivity } from './addListActivity';
import { addResourceKeepFile } from './addResourceKeepFile';
import { applyAndConfigureAboutLibrariesPlugin } from './applyAndConfigureAboutLibrariesPlugin';
import { declareAboutLibrariesPlugin } from './declareAboutLibrariesPlugin';

/**
 * Implementation of bare plugin's Android/Android TV setup
 *
 * It scans the NPM dependencies, generates AboutLibraries-compatible metadata for them,
 * installs & configures AboutLibraries Gradle plugin and adds Android Activity with a list of dependencies and their licenses
 */
export function androidCommand(androidProjectPath: string, scanLicenses: PluginLicensesScanner) {
  const licenses = scanLicenses(path.join(path.resolve(androidProjectPath, '..'), 'package.json'), 'android');

  const aboutLibrariesConfigDirPath = path.join(androidProjectPath, 'config');

  // Cleanup metadata in case scan options changed
  fs.rmSync(aboutLibrariesConfigDirPath, { recursive: true, force: true });

  writeAboutLibrariesNPMOutput(licenses, androidProjectPath);

  declareAboutLibrariesPlugin(androidProjectPath);
  applyAndConfigureAboutLibrariesPlugin(androidProjectPath);
  addListActivity(androidProjectPath);
  addResourceKeepFile(androidProjectPath);
}
