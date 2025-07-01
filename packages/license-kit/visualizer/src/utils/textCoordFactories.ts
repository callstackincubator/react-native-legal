import { DEFAULT_RADIUS, NODE_TEXT_PADDING } from '@/constants';
import type { TextCoordFactory } from '@/types/TextCoordFactory';

export const nameLabelYCoordFactory: TextCoordFactory = (node) => node.y - DEFAULT_RADIUS - NODE_TEXT_PADDING;
export const versionLabelYCoordFactory: TextCoordFactory = (node) => node.y - DEFAULT_RADIUS * 1.5 - NODE_TEXT_PADDING;
export const licenseLabelYCoordFactory: TextCoordFactory = (node) => node.y + DEFAULT_RADIUS + 10 + NODE_TEXT_PADDING;
