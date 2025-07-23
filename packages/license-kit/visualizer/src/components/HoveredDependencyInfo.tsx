import { categorizeLicense } from '@callstack/licenses';
import { ChangeHistoryTwoTone, Inventory2TwoTone } from '@mui/icons-material';
import { Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { usePrevious } from '@uidotdev/usehooks';
import React, { useMemo } from 'react';
import { tss } from 'tss-react/mui';

import { useVisualizerStore } from '@/store/visualizerStore';
import { getLicenseWarningColor } from '@/utils/colorUtils';
import { getCategoryChipColor, getCategoryIcon } from '@/utils/licenseCategoryUtils';

import ExternalLink from './ExternalLink';
import MarkdownBlock from './MarkdownBlock';

export default function HoveredDependencyInfo() {
  const { classes } = useStyles();
  const { hoveredLicense } = useVisualizerStore();

  // below var is used to still display the last hovered license in the sidebar when it becomes null in the store
  const prevHoveredLicenseValue = usePrevious(hoveredLicense);

  const displayLicense = hoveredLicense ?? prevHoveredLicenseValue;

  const hoveredDisplayCategoryLicense = useMemo(() => categorizeLicense(displayLicense?.type), [displayLicense]);

  return (
    <Stack direction="column" alignItems="center" justifyContent="center" gap={2} padding={2}>
      <Stack direction="column" alignItems="center">
        <Typography variant="caption">Currently hovered package ☝️</Typography>

        <Typography variant="h6" component="span">
          <pre className={classes.hoveredPackageName}>
            {displayLicense ? `${displayLicense?.name}@${displayLicense?.version}` : 'N/A'}
          </pre>
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="center" gap={2} width="100%" flexWrap="wrap">
        <Tooltip arrow title="Dependency type">
          <Chip icon={<Inventory2TwoTone />} label={displayLicense?.dependencyType ?? 'N/A'} />
        </Tooltip>

        <Tooltip arrow title="License type & category (package.json 'type' field)">
          <Chip
            sx={{
              // FIXME: for whatever reason, the custom background color is not applied to non-outlined chips, hence the below workaround
              backgroundColor: getLicenseWarningColor(hoveredDisplayCategoryLicense)?.main,
            }}
            icon={getCategoryIcon(hoveredDisplayCategoryLicense)}
            label={`${displayLicense?.type ?? '---'} (${hoveredDisplayCategoryLicense})`}
            color={getCategoryChipColor(hoveredDisplayCategoryLicense)}
          />
        </Tooltip>

        <Tooltip arrow title="Version specifier">
          <Chip icon={<ChangeHistoryTwoTone />} label={`Ver. spec.: ${displayLicense?.requiredVersion ?? 'N/A'}`} />
        </Tooltip>
      </Stack>

      <Stack direction="column" alignItems="center">
        {displayLicense?.url && <ExternalLink href={displayLicense.url} />}
        <Typography variant="body1">Author: {displayLicense?.author ?? '---'}</Typography>

        <Typography variant="body1" textAlign="center" width="100%" paddingLeft={2} paddingRight={2}>
          {displayLicense?.description ?? '(No package description available)'}
        </Typography>
      </Stack>

      <Divider orientation="horizontal" flexItem />

      <Typography variant="body1" width="100%" paddingLeft={2} paddingRight={2} component="div">
        <MarkdownBlock>
          {`${displayLicense?.file ? `*Source: \`${displayLicense.file}\`*` : ''}\n\n${
            displayLicense?.content ?? '(No license text available)'
          }`}
        </MarkdownBlock>
      </Typography>
    </Stack>
  );
}

const useStyles = tss.create(() => ({
  hoveredPackageName: {
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
}));
