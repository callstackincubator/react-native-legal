import { MiscUtils } from '@callstack/licenses';

import type { AboutLibrariesOptions } from './types';

/**
 * Applies Gradle Plugin Portal & AboutLibraries Gradle plugin repositories (if needed) inside root build.gradle
 */
export function declareAboutLibrariesPluginUtil(androidBuildGradleContent: string) {
  if (!androidBuildGradleContent.match(PLUGIN_CLASSPATH)?.length) {
    // Add Gradle Plugin Portal repository if it's not included
    if (!androidBuildGradleContent.match(GRADLE_PLUGIN_PORTAL_URL)?.length) {
      androidBuildGradleContent = androidBuildGradleContent.replace(
        /repositories\s?{/,
        `repositories {\n        maven { url = uri("${GRADLE_PLUGIN_PORTAL_URL}") }`,
      );
      console.log('Gradle Plugin Portal repository - ADDED');
    } else {
      console.log('Gradle Plugin Portal repository already added - SKIP');
    }

    // Declare the AboutLibraries plugin
    androidBuildGradleContent = androidBuildGradleContent.replace(
      /dependencies\s?{/,
      `dependencies {\n        classpath("${PLUGIN_CLASSPATH}:${PLUGIN_VERSION}")`,
    );
    console.log('About Libraries Gradle Plugin repository - ADDED');
  } else {
    console.log('About Libraries Gradle Plugin already added - SKIP');
  }

  return androidBuildGradleContent;
}

/**
 * Applies and configures AboutLibraries Grale plugin (if needed) inside app's build.gradle
 */
export function applyAndConfigureAboutLibrariesPluginUtil(
  androidAppBuildGradleContent: string,
  options?: AboutLibrariesOptions,
) {
  // Apply plugin
  const applyPluginBlockRegex = new RegExp(`apply\\s+plugin:\\s+['"]${PLUGIN_APPLY_BLOCK_IDENTIFIER}['"]`);

  if (!androidAppBuildGradleContent.match(applyPluginBlockRegex)?.length) {
    androidAppBuildGradleContent += `\n${PLUGIN_APPLY_BLOCK}`;
    console.log('About Libraries Gradle Plugin - APPLIED');
  } else {
    console.log('About Libraries Gradle Plugin already applied - SKIP');
  }

  // Configure plugin
  const pluginConfigRegex = /aboutLibraries\s*{/;
  const hasConfigBlock = androidAppBuildGradleContent.match(pluginConfigRegex)?.length;
  const gitHubApiToken = options?.gitHubApiToken;

  if (!hasConfigBlock) {
    const tokenLine = gitHubApiToken ? `    gitHubApiToken = "${gitHubApiToken}"\n` : '';

    androidAppBuildGradleContent += `\n\naboutLibraries {\n    configPath = "config"\n    prettyPrint = true\n${tokenLine}}\n`;
    console.log('About Libraries Gradle Plugin - CONFIGURED');
  } else {
    if (gitHubApiToken && !androidAppBuildGradleContent.match(/gitHubApiToken\s*=/)?.length) {
      androidAppBuildGradleContent = androidAppBuildGradleContent.replace(
        pluginConfigRegex,
        `aboutLibraries {\n    gitHubApiToken = "${gitHubApiToken}"`,
      );
      console.log('About Libraries Gradle Plugin - UPDATED');
    } else {
      console.log('About Libraries Gradle Plugin already configured - SKIP');
    }
  }

  console.log('androidAppBuildGradleContent', androidAppBuildGradleContent);

  return androidAppBuildGradleContent;
}

/**
 * adds a list activity to the list of application's activities
 */
export function addListActivityUtil<T>(activities: T[]): T[] {
  const listActivity = prepareListActivity();

  if (!MiscUtils.arrayIncludesObject(activities, listActivity)) {
    activities?.push(listActivity as T);
    console.log('About Libraries activity - ADDED');
  } else {
    console.log('About Libraries activity already added - SKIP');
  }

  return activities;
}

/**
 * This JS object will evaluate to the following XML content:
 *
 * <activity
 *   android:name="com.reactnativelegal.ReactNativeLegalActivity"
 *   android:exported="false"
 *   android:launchMode="singleTask"
 * />
 */
function prepareListActivity() {
  return {
    $: {
      'android:name': PLUGIN_ACTIVITY,
      'android:exported': 'false',
      'android:launchMode': 'singleTask',
    },
  } as const;
}

const GRADLE_PLUGIN_PORTAL_URL = 'https://plugins.gradle.org/m2';
const PLUGIN_ACTIVITY = 'com.reactnativelegal.ReactNativeLegalActivity';
const PLUGIN_APPLY_BLOCK = "apply plugin: 'com.mikepenz.aboutlibraries.plugin'";
const PLUGIN_APPLY_BLOCK_IDENTIFIER = 'com.mikepenz.aboutlibraries.plugin';
const PLUGIN_CLASSPATH = 'com.mikepenz.aboutlibraries.plugin:aboutlibraries-plugin';
const PLUGIN_VERSION = '11.6.3';
