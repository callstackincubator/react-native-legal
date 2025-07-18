'use client';

import 'katex/dist/katex.min.css';
import React, { useState } from 'react';
import { tss } from 'tss-react/mui';

import { Types } from '@callstack/licenses';
import { Analytics, BarChart, ChevronLeft, ChevronRight, ExpandMore } from '@mui/icons-material';
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

import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from '@/constants';
import { useVisualizerStore } from '@/store/visualizerStore';

import { UpdatingHeading } from './UpdatingHeading';
import Analysis from './tabs/Analysis';
import Charts from './tabs/Charts';

export type SidebarProps = {
  analysis: Types.LicenseAnalysisResult;
};

export default function Sidebar({ analysis }: SidebarProps) {
  const { classes } = useStyles();
  const { reportName, loadedAt } = useVisualizerStore();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

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

            <Tooltip title={sidebarExpanded ? 'Collapse Statistics' : 'Expand Statistics'}>
              <IconButton onClick={toggleSidebar} className={classes.toggleButton} color="primary">
                {sidebarExpanded ? <ChevronLeft /> : <ChevronRight />}
              </IconButton>
            </Tooltip>
          </Box>

          {sidebarExpanded && <UpdatingHeading reportName={reportName} loadedAt={loadedAt} />}
        </Stack>

        {/* collapsed sidebar */}
        {!sidebarExpanded && (
          <Stack className={classes.collapsedContent} spacing={1}>
            <Tooltip title="Analysis" placement="right" arrow>
              <Button onClick={toggleSidebar} color="primary" size="large" sx={{ flexDirection: 'column' }}>
                {analysis.permissiveness.score}

                <Analytics />
              </Button>
            </Tooltip>

            <Divider orientation="horizontal" flexItem />

            <Tooltip title="Report" placement="right" arrow>
              <Button onClick={toggleSidebar} color="primary" size="large" sx={{ flexDirection: 'column' }}>
                <BarChart />
              </Button>
            </Tooltip>
          </Stack>
        )}

        {/* expanded sidebar */}
        {sidebarExpanded && (
          <Stack style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics />

                  <Typography variant="body2">Analysis ({analysis.permissiveness.score})</Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box className={classes.statsContent}>
                  <Analysis analysis={analysis} />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChart />

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
}));
