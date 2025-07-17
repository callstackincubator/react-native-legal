import { LicenseCategory } from './types/LicenseCategory';

export const SIDEBAR_EXPANDED_WIDTH = 500;
export const SIDEBAR_COLLAPSED_WIDTH = 50;

export const DEFAULT_RADIUS = 24;
export const HOVER_RADIUS = DEFAULT_RADIUS + 5;

export const INACTIVE_HOVER_MODE_OPACITY = 0.3;

export const NODE_TEXT_PADDING = 10;

export const MAX_TREE_PARSING_DEPTH = 300;

export const LABEL_FONT_SIZE = 14;

export const PERMISSIVENESS_SCORE_WEIGHTS = {
  [LicenseCategory.PERMISSIVE]: 100,
  [LicenseCategory.WEAK_COPYLEFT]: 60,
  [LicenseCategory.STRONG_COPYLEFT]: 20,
  [LicenseCategory.UNKNOWN]: 10,
};

export const ROOT_PACKAGE_KEY = 'root@0.0.0';
