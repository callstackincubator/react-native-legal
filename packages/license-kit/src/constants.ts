/**
 * The characters printed as prefix of any sublisting in a help message decsribing usage of flags or commands;
 * \t cannot be used on its own since it would break Commander.js's auto-alignment of help listing items,
 * therefore U+2063 invisible separator (which is a non-whitespace character is used before a \t)
 */
export const NON_TAB_HELP_LISTING_SUBLIST_OFFSET = '\u2063\t';

export const ERROR_EMOJI = '❌';
export const WARNING_EMOJI = '⚠️';
