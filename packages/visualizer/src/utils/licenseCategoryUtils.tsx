import { LicenseCategory } from '@callstack/licenses';
import { CheckCircleTwoTone, ErrorOutlineTwoTone, HelpOutlineTwoTone, WarningTwoTone } from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material';

export function categoryToActronym(category: LicenseCategory): string {
  return category
    .split(' ')
    .map((x) => x.at(0))
    .join('');
}

export function getCategoryIcon(category: LicenseCategory, colorOverride?: SvgIconProps['color']) {
  switch (category) {
    case LicenseCategory.STRONG_COPYLEFT:
      return <ErrorOutlineTwoTone color={colorOverride ?? 'strongCopyleft'} />;

    case LicenseCategory.WEAK_COPYLEFT:
      return <WarningTwoTone color={colorOverride ?? 'weakCopyleft'} />;

    case LicenseCategory.PERMISSIVE:
      return <CheckCircleTwoTone color={colorOverride ?? 'permissive'} />;

    default:
      return <HelpOutlineTwoTone color={colorOverride ?? 'unknown'} />;
  }
}

export function getCategoryChipColor(category: LicenseCategory) {
  switch (category) {
    case LicenseCategory.STRONG_COPYLEFT:
      return 'strongCopyleft' as const;

    case LicenseCategory.WEAK_COPYLEFT:
      return 'weakCopyleft' as const;

    case LicenseCategory.PERMISSIVE:
      return 'permissive' as const;

    case LicenseCategory.UNKNOWN:
    default:
      return 'unknown' as const;
  }
}
