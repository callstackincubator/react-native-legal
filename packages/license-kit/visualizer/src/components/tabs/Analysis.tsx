import { categoryToActronym, getCategoryChipColor, getCategoryIcon } from '@/utils/licenseCategoryUtils';
import {
  LicenseCategory,
  Types,
  getLicenseCategoryDescription,
  getPermissivenessScoreDescription,
} from '@callstack/licenses';
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

import { useTabsStyles } from './styles';

export type AnalysisProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Analysis({ analysis }: AnalysisProps) {
  const { classes } = useTabsStyles();
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
    <Box className={classes.container}>
      <Box className={classes.gridContainer}>
        {/* overall score */}
        <Box className={classes.scoreContainer}>
          <Box className={classes.scoreSection}>
            <Typography variant="subtitle1" gutterBottom>
              Permissiveness Score:{' '}
              <span style={{ color: getScoreColor(analysis.permissiveness.score), textDecoration: 'underline' }}>
                {getPermissivenessScoreDescription(analysis.permissiveness.score)}
              </span>
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <LinearProgress
                variant="determinate"
                value={analysis.permissiveness.score}
                className={classes.progressBar}
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
              <Typography variant="caption" style={{ textTransform: 'none' }}>
                How was the above calculated?
              </Typography>
            </Button>

            <Collapse in={permissivenessEquationExpanded}>
              <Typography
                mt={1}
                variant="caption"
                style={{ textTransform: 'none', textAlign: 'justify' }}
                component="p"
              >
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
