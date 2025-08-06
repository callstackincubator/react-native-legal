import type { Types } from '@callstack/licenses';

import { buildPackageKey } from './utils/packageUtils';

export const SIDEBAR_EXPANDED_WIDTH = 550;
export const SIDEBAR_COLLAPSED_WIDTH = 50;

export const DEFAULT_RADIUS = 24;
export const HOVER_RADIUS = DEFAULT_RADIUS + 5;

export const INACTIVE_HOVER_MODE_OPACITY = 0.3;

export const NODE_TEXT_PADDING = 10;

export const MAX_TREE_PARSING_DEPTH = 300;

export const LABEL_FONT_SIZE = 14;

export const ROOT_PROJECT_ROOT_PACKAGE: Types.License = {
  name: 'root',
  dependencyType: 'dependency',
  version: '0.0.0',
  requiredVersion: '0.0.0',
  parentPackages: [],
};

export const ROOT_PROJECT_ROOT_PACKAGE_KEY = buildPackageKey(ROOT_PROJECT_ROOT_PACKAGE);
