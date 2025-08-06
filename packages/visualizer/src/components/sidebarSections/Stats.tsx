import type { LicenseCategory, Types } from '@callstack/licenses';
import { getLicenseCategoryDescription } from '@callstack/licenses';
import { Box, Chip, Divider, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { getCategoryChipColor, getCategoryIcon } from '@/utils/licenseCategoryUtils';

import { useTabsStyles } from './styles';

export type StatsProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Stats({ analysis }: StatsProps) {
  const { classes } = useTabsStyles();
  const { palette } = useTheme();

  const sortedLicenses = useMemo(
    () => Object.entries(analysis.byLicense).sort(([, a], [, b]) => b - a),
    [analysis.byLicense],
  );
  const totalPackages = analysis.total;

  return (
    <Box className={classes.container}>
      <Box className={classes.gridContainer}>
        <Box className={classes.descriptionContainer}>
          <Box className={classes.descriptionSection}>
            <Typography
              variant="subtitle1"
              gutterBottom
              style={{
                color: analysis.categoriesPresence.hasAllPermissive
                  ? palette.permissive.main
                  : analysis.categoriesPresence.hasAnyUnknown
                    ? palette.unknown.main
                    : analysis.categoriesPresence.hasAnyStrongCopyleft
                      ? palette.strongCopyleft.main
                      : palette.weakCopyleft.main,
              }}
            >
              {analysis.description}
            </Typography>
          </Box>
        </Box>

        {/* category breakdown */}
        <Box className={classes.categoryContainer}>
          <Typography variant="subtitle1" gutterBottom>
            License Categories ({totalPackages} packages)
          </Typography>

          <Box className={classes.categoryGrid}>
            {Object.entries(analysis.byCategory).map(([category, count]) => {
              let percentage = totalPackages > 0 ? Math.round((count / totalPackages) * 100) : 0;

              // ensure at least 1% for display purposes
              if (count > 0 && percentage === 0) {
                percentage = 1;
              }

              // ensure no 99% rounded to 100% if the count is not really 100%
              if (percentage === 100 && count < totalPackages) {
                percentage = 99;
              }

              return (
                <Box key={category} className={classes.categoryItem}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getCategoryIcon(category as LicenseCategory, count === 0 ? 'disabled' : undefined)}
                    <Typography variant="body2" color={count === 0 ? 'textDisabled' : undefined}>
                      {getLicenseCategoryDescription(category as LicenseCategory)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      disabled={count === 0}
                      label={`${count} (${percentage}%)`}
                      size="small"
                      color={getCategoryChipColor(category as LicenseCategory)}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* all licenses */}
        <Box className={classes.groupContainer}>
          <Typography variant="subtitle1" gutterBottom>
            Discovered license types
          </Typography>

          <List className={classes.licenseList}>
            {sortedLicenses.map(([license, count], index) => {
              const percentage = totalPackages > 0 ? Math.round((count / totalPackages) * 100) : 0;

              return (
                <React.Fragment key={license}>
                  <ListItem>
                    <ListItemText primary={license} secondary={`${count} packages (${percentage}%)`} />
                  </ListItem>

                  {index < sortedLicenses.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
