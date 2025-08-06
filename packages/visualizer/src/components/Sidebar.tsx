import type { Types } from '@callstack/licenses';
import {
  AnalyticsTwoTone,
  BarChartTwoTone,
  ChevronLeftTwoTone,
  ChevronRightTwoTone,
  DarkModeTwoTone,
  ExpandMoreTwoTone,
  HelpOutlineTwoTone,
  InfoOutlineTwoTone,
  LightModeTwoTone,
  SmartToyTwoTone,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import { tss } from 'tss-react/mui';

import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from '@/constants';
import { useAppStore } from '@/store/appStore';
import { useVisualizerStore } from '@/store/visualizerStore';

import HoveredDependencyInfo from './HoveredDependencyInfo';
import { UpdatingHeading } from './UpdatingHeading';
import Charts from './sidebarSections/Charts';
import Disclaimer from './sidebarSections/Disclaimer';
import Help from './sidebarSections/Help';
import Stats from './sidebarSections/Stats';
import Summary from './sidebarSections/Summary';

export type SidebarProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Sidebar({ analysis }: SidebarProps) {
  const { classes } = useStyles();
  const { reportName, loadedAt } = useVisualizerStore();
  const { themeMode, setThemeMode } = useAppStore();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((previous) => !previous);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [setThemeMode, themeMode]);

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
          <Stack sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <HoveredDependencyInfo />

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AnalyticsTwoTone />

                  <Typography variant="body2">
                    Stats & permissiveness ({Math.floor(analysis.permissiveness.score)}%)
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box className={classes.accordionContents}>
                  <Stats analysis={analysis} />
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
                <Box className={classes.accordionContents}>
                  <Charts analysis={analysis} />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyTwoTone />

                  <Typography variant="body2">AI summary</Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box className={classes.accordionContents}>
                  <Summary />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoOutlineTwoTone />

                  <Typography variant="body2">Disclaimer</Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box className={classes.accordionContents}>
                  <Disclaimer />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HelpOutlineTwoTone />

                  <Typography variant="body2">Help</Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box className={classes.accordionContents}>
                  <Help />
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

            <Divider orientation="horizontal" flexItem />

            <Tooltip title="Disclaimer" placement="right" arrow>
              <span>
                <Button onClick={toggleSidebar} color="primary" size="large" sx={{ flexDirection: 'column' }}>
                  <InfoOutlineTwoTone />
                </Button>
              </span>
            </Tooltip>

            <Divider orientation="horizontal" flexItem />

            <Tooltip title="Help" placement="right" arrow>
              <span>
                <Button onClick={toggleSidebar} color="primary" size="large" sx={{ flexDirection: 'column' }}>
                  <HelpOutlineTwoTone />
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
  accordionContents: {
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
}));
