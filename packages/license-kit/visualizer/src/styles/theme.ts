import { getLicenseWarningColor } from '@/utils/colorUtils';
import { LicenseCategory } from '@/types/LicenseCategory';
import { createTheme, PaletteOptions } from '@mui/material';

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

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#70ca9d',
    },
    secondary: {
      main: '#b89dff',
    },
    strongCopyleft: getLicenseWarningColor(LicenseCategory.STRONG_COPYLEFT) as PaletteOptions['strongCopyleft'],
    weakCopyleft: getLicenseWarningColor(LicenseCategory.WEAK_COPYLEFT) as PaletteOptions['weakCopyleft'],
    permissive: getLicenseWarningColor(LicenseCategory.PERMISSIVE) as PaletteOptions['permissive'],
    unknown: getLicenseWarningColor(LicenseCategory.UNKNOWN) as PaletteOptions['unknown'],
  },
});
