import { useVisualizerStore } from '@/store/visualizerStore';
import { DependencyType } from '@/types/DependencyType';
import {
  InventoryTwoTone as DependenciesIcon,
  RocketLaunchTwoTone as DevDependenciesIcon,
  FlakyTwoTone as OptionalDependenciesIcon,
} from '@mui/icons-material';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React from 'react';

import { useTabsStyles } from './styles';

export default function Filters() {
  const { classes } = useTabsStyles();
  const { visibleDependencyTypes, toggleDependencyTypeVisibility } = useVisualizerStore();

  return (
    <Box className={classes.container}>
      <Box className={classes.gridContainer}>
        <Box className={classes.groupContainer}>
          <Typography variant="subtitle1" gutterBottom>
            Visual filters
          </Typography>

          <ToggleButtonGroup
            orientation="vertical"
            value={visibleDependencyTypes}
            onChange={(_event, value) => {
              toggleDependencyTypeVisibility(value as DependencyType);
            }}
          >
            <ToggleButton value={DependencyType.DEPENDENCY}>
              <DependenciesIcon />
            </ToggleButton>
            <ToggleButton value={DependencyType.DEV_DEPENDENCY}>
              <DevDependenciesIcon />
            </ToggleButton>
            <ToggleButton value={DependencyType.OPTIONAL_DEPENDENCY}>
              <OptionalDependenciesIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Box>
  );
}
