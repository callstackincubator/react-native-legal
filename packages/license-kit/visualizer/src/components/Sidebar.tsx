import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from '@/constants';
import { useAppStore } from '@/store/appStore';
import { useVisualizerStore } from '@/store/visualizerStore';
import { getLicenseWarningColor } from '@/utils/colorUtils';
import { getCategoryChipColor, getCategoryIcon } from '@/utils/licenseCategoryUtils';
import { Types, categorizeLicense } from '@callstack/licenses';
import {
  AnalyticsTwoTone,
  BarChartTwoTone,
  ChangeHistoryTwoTone,
  ChevronLeftTwoTone,
  ChevronRightTwoTone,
  DarkModeTwoTone,
  ExpandMoreTwoTone,
  Inventory2TwoTone,
  LightModeTwoTone,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { usePrevious } from '@uidotdev/usehooks';
import React, { useCallback, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { tss } from 'tss-react/mui';

import ExternalLink from './ExternalLink';
import { UpdatingHeading } from './UpdatingHeading';
import Analysis from './tabs/Analysis';
import Charts from './tabs/Charts';

export type SidebarProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Sidebar({ analysis }: SidebarProps) {
  const { classes } = useStyles();
  const { reportName, loadedAt, hoveredLicense } = useVisualizerStore();
  const { themeMode, setThemeMode } = useAppStore();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((previous) => !previous);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [setThemeMode, themeMode]);

  // below var is used to still display the last hovered license in the sidebar when it becomes null in the store
  const prevHoveredLicenseValue = usePrevious(hoveredLicense);

  const displayLicense = hoveredLicense ?? prevHoveredLicenseValue;

  const hoveredDisplayCategoryLicense = useMemo(() => categorizeLicense(displayLicense?.type), [displayLicense]);

  return (
    <>
      {/* sidebar */}
      <Paper
        elevation={3}
        className={classes.sidebar}
        style={{
          width: sidebarExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        }}
      >
        {/* toggle sidebar trigger button */}
        <Stack direction="column" className={classes.sidebarHeader}>
          <Box className={classes.toggleContainer}>
            <pre className={classes.sidebarHeading}>license-kit visualize</pre>

            <Tooltip title="Toggle theme" arrow>
              <IconButton onClick={toggleThemeMode}>
                {themeMode === 'dark' ? <DarkModeTwoTone /> : <LightModeTwoTone />}
              </IconButton>
            </Tooltip>

            <Tooltip title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'} arrow>
              <IconButton onClick={toggleSidebar} className={classes.toggleButton}>
                {sidebarExpanded ? <ChevronLeftTwoTone /> : <ChevronRightTwoTone />}
              </IconButton>
            </Tooltip>
          </Box>

          {sidebarExpanded && <UpdatingHeading reportName={reportName} loadedAt={loadedAt} />}
        </Stack>

        {sidebarExpanded ? (
          /* expanded sidebar */
          <Stack style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="column" alignItems="center" justifyContent="center" gap={2} padding={2}>
              <Stack direction="column" alignItems="center">
                <Typography variant="caption">Currently hovered package ☝️</Typography>

                <Typography variant="h6" component="span">
                  <pre className={classes.hoveredPackageName}>
                    {displayLicense?.name}@{displayLicense?.version}
                  </pre>
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="center" gap={2} width="100%" flexWrap="wrap">
                <Chip icon={<Inventory2TwoTone />} label={displayLicense?.dependencyType} />

                <Tooltip arrow title="License type & category (package.json field)">
                  <Chip
                    sx={{
                      // FIXME: for whatever reason, the custom background color is not applied to non-outlined chips, hence the below workaround
                      backgroundColor: getLicenseWarningColor(hoveredDisplayCategoryLicense)?.main,
                    }}
                    icon={getCategoryIcon(hoveredDisplayCategoryLicense)}
                    label={`${displayLicense?.type ?? 'N/A'} (${hoveredDisplayCategoryLicense})`}
                    color={getCategoryChipColor(hoveredDisplayCategoryLicense)}
                  />
                </Tooltip>

                <Chip icon={<ChangeHistoryTwoTone />} label={`Ver. specifier: ${displayLicense?.requiredVersion}`} />
              </Stack>

              <Stack direction="column" alignItems="center">
                {displayLicense?.url && <ExternalLink href={displayLicense.url} />}
                <Typography variant="body1">Author: {displayLicense?.author}</Typography>

                <Typography variant="body1" textAlign="center" width="100%" paddingLeft={2} paddingRight={2}>
                  {displayLicense?.description ?? '(No package description available)'}
                </Typography>
              </Stack>

              <Divider orientation="horizontal" flexItem />

              <Typography variant="body1" width="100%" paddingLeft={2} paddingRight={2}>
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ children, href }) => (
                      <ExternalLink href={href as string} inline>
                        {children}
                      </ExternalLink>
                    ),
                  }}
                >
                  {`${displayLicense?.file ? `*Source: \`${displayLicense.file}\`*` : ''}\n\n${
                    displayLicense?.content ?? '(No license text available)'
                  }`}
                </Markdown>
              </Typography>
            </Stack>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AnalyticsTwoTone />

                  <Typography variant="body2">Analysis ({Math.floor(analysis.permissiveness.score)}%)</Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box className={classes.statsContent}>
                  <Analysis analysis={analysis} />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartTwoTone />

                  <Typography variant="body2">Statistics</Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box className={classes.statsContent}>
                  <Charts analysis={analysis} />
                </Box>
              </AccordionDetails>
            </Accordion>
          </Stack>
        ) : (
          /* collapsed sidebar */
          <Stack className={classes.collapsedContent} spacing={1}>
            <Tooltip title="Analysis" placement="right" arrow>
              <span>
                <Button onClick={toggleSidebar} color="primary" size="large" sx={{ flexDirection: 'column' }}>
                  {Math.floor(analysis.permissiveness.score)}

                  <AnalyticsTwoTone />
                </Button>
              </span>
            </Tooltip>

            <Divider orientation="horizontal" flexItem />

            <Tooltip title="Report" placement="right" arrow>
              <span>
                <Button onClick={toggleSidebar} color="primary" size="large" sx={{ flexDirection: 'column' }}>
                  <BarChartTwoTone />
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}
      </Paper>
    </>
  );
}

const useStyles = tss.create(({ theme }) => ({
  mainContainer: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  sidebar: {
    flexShrink: 0,
    height: '100vh',
    overflow: 'auto',
    borderRadius: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(2),
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  toggleButton: {
    padding: theme.spacing(1),
  },
  collapsedContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2, 1),
  },
  statsContent: {
    flex: 1,
    overflow: 'auto',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  svg: {
    display: 'flex',
    flex: 1,
  },
  sidebarHeading: {
    flex: 1,
    textAlign: 'start',
  },
  hoveredPackageName: {
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
}));
