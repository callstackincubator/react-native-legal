import path from 'path';

import glob from 'glob';
import type { XcodeProject } from 'xcode';
import xcode from 'xcode';

const ignoredPaths = ['**/@(Carthage|Pods|vendor|node_modules)/**'];

/**
 * Used to obtain first target of type "com.apple.product-type.application"
 */
export function getFirstApplicationNativeTarget(pbxproj: XcodeProject) {
  return pbxproj.getTarget('com.apple.product-type.application');
}

/**
 * Used to get all targets of type "com.apple.product-type.application"
 */
export function getAllApplicationNativeTargets(pbxproj: XcodeProject) {
  const targets = pbxproj.getFirstProject().firstProject.targets;
  const nativeTargets = pbxproj.pbxNativeTargetSection();

  return targets.reduce(
    (acc, target) => {
      const targetUuid = target.value;

      if (nativeTargets[targetUuid].productType === '"com.apple.product-type.application"') {
        return [...acc, { uuid: targetUuid, target: nativeTargets[targetUuid] }];
      }

      return acc;
    },
    [] as {
      uuid: string;
      target: xcode.PBXNativeTarget;
    }[],
  );
}

/**
 * Used to add the file to all "Resources" build phases
 *
 * It's very handy especially when we have multiple application targets and each of them has separate "Resources" build phase
 */
export function addToAllPbxResourcesBuildPhases(pbxproj: XcodeProject, pbxFile: pbxFile) {
  getAllApplicationNativeTargets(pbxproj).map((nativeTarget) => {
    nativeTarget.target.buildPhases.map((buildPhase) => {
      if (buildPhase.comment !== RESOURCES_BUILD_PHASE_IDENTIFIER) {
        return;
      }

      const section: Record<
        string,
        | {
            [key: string]: any;
            isa: 'PBXResourcesBuildPhase';
            name: string;
          }
        | string
      > = pbxproj.hash.project.objects['PBXResourcesBuildPhase'];
      const buildPhaseKey = buildPhase.value + '_comment';

      for (const key in section) {
        if (!COMMENT_KEY.test(key) || (buildPhaseKey && buildPhaseKey !== key)) {
          continue;
        }

        if (typeof section[key] === 'string' && section[key] === RESOURCES_BUILD_PHASE_IDENTIFIER) {
          const sectionKey = key.split(COMMENT_KEY)[0];
          const sources = section[sectionKey];

          if (typeof sources === 'object') {
            sources.files.push({
              value: pbxFile.uuid,
              comment: `${pbxFile.basename} in ${pbxFile.group}`,
            });
            pbxproj.hash.project.objects['PBXResourcesBuildPhase'][sectionKey] = sources;
          }
        }
      }
    });
  });
}

/**
 * Returns the name of the main group in the project (the main folder where `AppDelegate` usually lives)
 */
export function getIOSProjectName(iosProjectPath: string) {
  const [appDelegatePath] = glob.sync('*/AppDelegate.@(m|mm|swift)', {
    cwd: iosProjectPath,
    absolute: true,
    nocase: true,
    nodir: true,
    ignore: ignoredPaths,
  });

  return path.basename(path.dirname(appDelegatePath));
}

/**
 * Used to grab the XcodeProject instance
 */
export function getIOSPbxProj(iosProjectPath: string) {
  const [xcodeprojPath] = glob.sync('*.xcodeproj', {
    cwd: iosProjectPath,
    absolute: true,
    nocase: true,
    nodir: false,
    ignore: ignoredPaths,
  });
  const pbxprojPath = path.join(xcodeprojPath, 'project.pbxproj');
  const pbxproj = xcode.project(pbxprojPath);

  pbxproj.parseSync();
  return { pbxproj, pbxprojPath };
}

const RESOURCES_BUILD_PHASE_IDENTIFIER = 'Resources';
const COMMENT_KEY = /_comment$/;
