interface pbxFile {
  basename: string;
  lastKnownFileType?: string;
  group?: string;
  path?: string;
  fileEncoding?: number;
  defaultEncoding?: number;
  sourceTree: string;
  includeInIndex?: number;
  explicitFileType?: unknown;
  settings?: object;
  uuid?: string;
  fileRef: string;
  target?: string;
}

type ProductType =
  | 'com.apple.product-type.application'
  | 'com.apple.product-type.app-extension'
  | 'com.apple.product-type.bundle'
  | 'com.apple.product-type.tool'
  | 'com.apple.product-type.library.dynamic'
  | 'com.apple.product-type.framework'
  | 'com.apple.product-type.library.static'
  | 'com.apple.product-type.bundle.unit-test'
  | 'com.apple.product-type.application.watchapp'
  | 'com.apple.product-type.application.watchapp2'
  | 'com.apple.product-type.watchkit-extension'
  | 'com.apple.product-type.watchkit2-extension';

declare module 'xcode' {
  interface PBXNativeTarget {
    isa: 'PBXNativeTarget';
    buildConfigurationList: string;
    buildConfigurationList_comment: string;
    buildPhases: {
      value: string;
      comment: string;
    }[];
    buildRules: [];
    dependencies: {
      value: string;
      comment: string;
    }[];
    name: string;
    productName: string;
    productReference: string;
    productReference_comment: string;
    productType: string;
  }

  interface PBXProject {
    isa: 'PBXProject';
    attributes: {
      LastUpgradeCheck: number;
      TargetAttributes: Record<
        string,
        {
          CreatedOnToolsVersion?: string;
          TestTargetID?: string;
          LastSwiftMigration?: number;
          ProvisioningStyle?: string;
        } & Record<string, string | number | undefined>
      >;
    };
    buildConfigurationList: string;
    buildConfigurationList_comment: string;
    compatibilityVersion: string;
    developmentRegion: string;
    hasScannedForEncodings: number;
    knownRegions: string[];
    mainGroup: string;
    productRefGroup: string;
    productRefGroup_comment: string;
    projectDirPath: string;
    projectRoot: string;
    targets: {
      value: string;
      comment: string;
    }[];
  }

  type XCObjectType =
    | 'PBXBuildFile'
    | 'PBXFileReference'
    | 'PBXFrameworksBuildPhase'
    | 'PBXGroup'
    | 'PBXNativeTarget'
    | 'PBXProject'
    | 'PBXResourcesBuildPhase'
    | 'PBXShellScriptBuildPhase'
    | 'PBXSourcesBuildPhase'
    | 'PBXVariantGroup'
    | 'PBXTargetDependency'
    | 'XCBuildConfiguration'
    | 'XCConfigurationList';

  export class XcodeProject {
    constructor(pbxprojPath: string);

    hash: {
      headComment: string;
      project: {
        archiveVersion: number;
        objectVersion: number;
        objects: {
          [T in XCObjectType]: Record<
            string,
            {
              isa: T;
              name: string;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [key: string]: any;
            }
          >;
        };
        rootObject: string;
        rootObject_comment: string;
      };
    };

    addBuildPhase(
      filePathsArray: string[],
      buildPhaseType: 'PBXShellScriptBuildPhase' | 'PBXCopyFilesBuildPhase',
      comment: string,
      target: string,
      optionsOrFolderType:
        | {
            inputPaths?: string[];
            outputPaths?: string[];
            shellPath: string;
            shellScript: string;
          }
        | string,
      subfolderPath?: string,
    ): {
      uuid: string;
      buildPhase: {
        isa: string;
        buildActionMask: number;
        files: unknown[];
        runOnlyForDeploymentPostprocessing: number;
      };
    };
    addFile(path: string, group?: string, opt?: FileOptions): pbxFile | null;
    removeFile(path: string, group?: string, opt?: FileOptions): pbxFile | null;
    addToPbxBuildFileSection(file: pbxFile): void;
    addToPbxResourcesBuildPhase(file: pbxFile): void;
    buildPhase(group: string, target: string): string | undefined;
    findPBXGroupKey(criteria: { name?: string; path?: string }): string | undefined;
    generateUuid(): string;
    getFirstProject(): { uuid: string; firstProject: PBXProject };
    getTarget(productType: ProductType): { uuid: string; target: PBXNativeTarget } | null;
    pbxNativeTargetSection(): Record<string, PBXNativeTarget> & Record<string, string>;
    parseSync(): void;
    writeSync(options?: { omitEmptyValues?: boolean }): string;
  }

  type FileOptions = Partial<{
    plugin: string;
    target: string;
    variantGroup: string;
    lastKnownFileType: string;
    defaultEncoding: number;
    customFramework: boolean;
    explicitFileType: number;
    weak: boolean;
    compilerFlags: string;
    embed: boolean;
    sign: boolean;
  }>;

  export function project(projectPath: string): XcodeProject;
}
