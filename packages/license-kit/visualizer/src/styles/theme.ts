import { getLicenseWarningColor } from '@/utils/colorUtils';
import { LicenseCategory } from '@callstack/licenses';
import { PaletteOptions, createTheme } from '@mui/material';
import { green, purple } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Palette {
    strongCopyleft: Palette['primary'];
    weakCopyleft: Palette['primary'];
    permissive: Palette['primary'];
    unknown: Palette['primary'];
  }

  interface PaletteOptions {
    strongCopyleft?: PaletteOptions['primary'];
    weakCopyleft?: PaletteOptions['primary'];
    permissive?: PaletteOptions['primary'];
    unknown?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    strongCopyleft: true;
    weakCopyleft: true;
    permissive: true;
    unknown: true;
  }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    strongCopyleft: true;
    weakCopyleft: true;
    permissive: true;
    unknown: true;
  }
}

const baseTheme = {
  palette: {
    primary: {
      main: green[500],
    },
    secondary: {
      main: purple[300],
    },
    strongCopyleft: getLicenseWarningColor(LicenseCategory.STRONG_COPYLEFT) as PaletteOptions['strongCopyleft'],
    weakCopyleft: getLicenseWarningColor(LicenseCategory.WEAK_COPYLEFT) as PaletteOptions['weakCopyleft'],
    permissive: getLicenseWarningColor(LicenseCategory.PERMISSIVE) as PaletteOptions['permissive'],
    unknown: getLicenseWarningColor(LicenseCategory.UNKNOWN) as PaletteOptions['unknown'],
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'light',
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    mode: 'dark',
  },
});
