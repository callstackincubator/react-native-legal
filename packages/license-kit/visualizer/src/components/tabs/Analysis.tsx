import React from 'react';
import { Box, Typography, Chip, LinearProgress, List, ListItem, ListItemText, Divider, useTheme } from '@mui/material';
import { Warning, CheckCircle, ErrorOutline, HelpOutline } from '@mui/icons-material';

import { useTabsStyles } from './styles';
import {
  getLicenseCategoryDescription,
  getPermissivenessScoreDescription,
  LicenseCategory,
  Types,
} from '@callstack/licenses';

export type AnalysisProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Analysis({ analysis }: AnalysisProps) {
  const { classes } = useTabsStyles();
  const { palette } = useTheme();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return palette.success.main;
    if (score >= 60) return palette.warning.main;
    return palette.error.main;
  };

  const getCategoryIcon = (category: LicenseCategory) => {
    switch (category) {
      case LicenseCategory.STRONG_COPYLEFT:
        return <ErrorOutline color="strongCopyleft" />;

      case LicenseCategory.WEAK_COPYLEFT:
        return <Warning color="weakCopyleft" />;

      case LicenseCategory.PERMISSIVE:
        return <CheckCircle color="permissive" />;

      default:
        return <HelpOutline color="unknown" />;
    }
  };

  const getCategoryChipColor = (category: LicenseCategory) => {
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
  };

  const sortedLicenses = Object.entries(analysis.byLicense).sort(([, a], [, b]) => b - a);
  const totalPackages = analysis.total;

  return (
    <Box className={classes.container}>
      <Box className={classes.gridContainer}>
        {/* overall score */}
        <Box className={classes.scoreContainer}>
          <Box className={classes.scoreSection}>
            <Typography variant="subtitle1" gutterBottom>
              Permissiveness Score
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <LinearProgress
                variant="determinate"
                value={analysis.permissivenessScore}
                className={classes.progressBar}
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(analysis.permissivenessScore),
                  },
                }}
              />
              <Typography variant="h6" color={getScoreColor(analysis.permissivenessScore)}>
                {analysis.permissivenessScore}%
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {getPermissivenessScoreDescription(analysis.permissivenessScore)}
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
              const percentage = totalPackages > 0 ? Math.round((count / totalPackages) * 100) : 0;

              return (
                <Box key={category} className={classes.categoryItem}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getCategoryIcon(category as LicenseCategory)}
                    <Typography variant="body2">
                      {getLicenseCategoryDescription(category as LicenseCategory)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
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
