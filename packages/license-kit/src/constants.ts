/**
 * https://spdx.org/licenses
 */

export const STRONG_COPYLEFT_LICENSES = [
  'GPL',
  'GPL-1.0',
  'GPL-1.0+',
  'GPL-2.0',
  'GPL-2.0+',
  'GPL-2.0-only',
  'GPL-2.0-or-later',
  'GPL-3.0',
  'GPL-3.0+',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'AGPL-3.0',
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  'EUPL-1.0',
  'EUPL-1.1',
  'EUPL-1.2',
  'OSL-1.0',
  'OSL-1.1',
  'OSL-2.0',
  'OSL-2.1',
  'OSL-3.0',
];
export const WEAK_COPYLEFT_LICENSES = [
  'CDDL-1.0',
  'CDDL-1.1',
  'EPL-1.0',
  'EPL-2.0',
  'LGPL',
  'LGPL-2.0',
  'LGPL-2.0+',
  'LGPL-2.0-only',
  'LGPL-2.0-or-later',
  'LGPL-2.1',
  'LGPL-2.1+',
  'LGPL-2.1-only',
  'LGPL-2.1-or-later',
  'LGPL-3.0',
  'LGPL-3.0+',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'MPL-1.1',
  'MPL-2.0',
];

/**
 * The characters printed as prefix of any sublisting in a help message decsribing usage of flags or commands;
 * \t cannot be used on its own since it would break Commander.js's auto-alignment of help listing items,
 * therefore U+2063 invisible separator (which is a non-whitespace character is used before a \t)
 */
export const NON_TAB_HELP_LISTING_SUBLIST_OFFSET = '\u2063\t';

export const ERROR_EMOJI = '❌';
export const WARNING_EMOJI = '⚠️';
