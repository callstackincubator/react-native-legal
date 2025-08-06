import type { LicenseCategory, Types } from '@callstack/licenses';
import { getLicenseCategoryDescription, getPermissivenessScoreDescription } from '@callstack/licenses';
import { ExpandLessTwoTone, ExpandMoreTwoTone } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';
import React, { useCallback, useMemo, useState } from 'react';
import { tss } from 'tss-react/mui';

import { categoryToActronym, getCategoryChipColor, getCategoryIcon } from '@/utils/licenseCategoryUtils';

import { useTabsStyles } from './styles';

export type StatsProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Stats({ analysis }: StatsProps) {
  const { classes: tabsClasses } = useTabsStyles();
  const { classes } = useStyles();
  const { palette } = useTheme();

  const [permissivenessEquationExpanded, setPermissivenessEquationExpanded] = useState(false);

  const getScoreColor = useCallback(
    (score: number): string => {
      if (score >= 80) return palette.success.main;
      if (score >= 60) return palette.warning.main;
      return palette.error.main;
    },
    [palette.error.main, palette.success.main, palette.warning.main],
  );

  const sortedLicenses = useMemo(
    () => Object.entries(analysis.byLicense).sort(([, a], [, b]) => b - a),
    [analysis.byLicense],
  );
  const totalPackages = analysis.total;

  return (
    <Box className={tabsClasses.container}>
      <Box className={tabsClasses.gridContainer}>
        {/* overall score */}
        <Box className={tabsClasses.scoreContainer}>
          <Box className={tabsClasses.scoreSection}>
            <Typography variant="subtitle1" gutterBottom>
              Permissiveness Score:{' '}
              <span style={{ color: getScoreColor(analysis.permissiveness.score) }} className={classes.underlineText}>
                {getPermissivenessScoreDescription(analysis.permissiveness.score)}
              </span>
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <LinearProgress
                variant="determinate"
                value={analysis.permissiveness.score}
                className={tabsClasses.progressBar}
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(analysis.permissiveness.score),
                  },
                }}
              />
              <Typography variant="h6" color={getScoreColor(analysis.permissiveness.score)}>
                {Math.floor(analysis.permissiveness.score)}%
              </Typography>
            </Box>

            <Button
              onClick={() => setPermissivenessEquationExpanded(!permissivenessEquationExpanded)}
              startIcon={permissivenessEquationExpanded ? <ExpandLessTwoTone /> : <ExpandMoreTwoTone />}
            >
              <Typography variant="caption" className={classes.textTransformNone}>
                How was the above calculated?
              </Typography>
            </Button>

            <Collapse in={permissivenessEquationExpanded}>
              <Typography mt={1} variant="caption" className={classes.headingDescription} component="p">
                The &apos;permissiveness score&apos; is a custom reference value that has no strictly binding meaning,
                it may be helpful in having a general idea of how permissive the licenses are. To put it shortly, it is
                a weighted average of the count of licenses within each of the categories, multiplied by a predefined
                weight (as shown below).
              </Typography>

              <span
                className="katex"
                ref={(ref) => {
                  if (ref) {
                    renderMathInElement(ref, {
                      delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                      ],
                    });
                  }
                }}
              >
                {`$$${analysis.permissiveness.score.toFixed(2)}\\% = \\dfrac{${Object.entries(
                  analysis.permissiveness.weightedSumComponents,
                )
                  .map(
                    ([category, { count }]) => `w_{${categoryToActronym(category as LicenseCategory)}} \\cdot ${count}`,
                  )
                  .join(' + ')}}{\\Sigma w}$$

                $\\text{such that weights} \\ w \\ \\text{are:} \\\\
                ${Object.entries(analysis.permissiveness.weightedSumComponents)
                  .map(([category, { weight }]) => `w_{${categoryToActronym(category as LicenseCategory)}} = ${weight}`)
                  .join(', \\ ')}
                $`}
              </span>
            </Collapse>
          </Box>
        </Box>

        {/* category breakdown */}
        <Box className={tabsClasses.categoryContainer}>
          <Typography variant="subtitle1" gutterBottom>
            License Categories ({totalPackages} packages)
          </Typography>

          <Box className={tabsClasses.categoryGrid}>
            {Object.entries(analysis.byCategory).map(([category, count]) => {
              const percentage = totalPackages > 0 ? Math.round((count / totalPackages) * 100) : 0;

              return (
                <Box key={category} className={tabsClasses.categoryItem}>
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
        <Box className={tabsClasses.groupContainer}>
          <Typography variant="subtitle1" gutterBottom>
            Discovered license types
          </Typography>

          <List className={tabsClasses.licenseList}>
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

const useStyles = tss.create(() => ({
  underlineText: {
    textDecoration: 'underline',
  },
  textTransformNone: {
    textTransform: 'none',
  },
  headingDescription: { textTransform: 'none', textAlign: 'justify' },
}));
