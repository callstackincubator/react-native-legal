import { LicenseCategory } from '@callstack/licenses';
import { amber, green, orange, red } from '@mui/material/colors';

/**
 * Gets the warning color for a license category
 * @param category the license category
 * @returns the warning color for the license category
 */
export function getLicenseWarningColor(
  category: LicenseCategory,
): { main: string; light: string; dark: string } | null {
  switch (category) {
    case LicenseCategory.STRONG_COPYLEFT:
      return {
        main: red[500],
        light: red[400],
        dark: red[700],
      };

    case LicenseCategory.WEAK_COPYLEFT:
      return {
        main: orange[700],
        light: orange[600],
        dark: orange[800],
      };

    case LicenseCategory.PERMISSIVE:
      return {
        main: green[700],
        light: green[600],
        dark: green[800],
      };

    case LicenseCategory.UNKNOWN:
      return {
        main: amber[400],
        light: amber[300],
        dark: amber[700],
      };

    default:
      return null;
  }
}
