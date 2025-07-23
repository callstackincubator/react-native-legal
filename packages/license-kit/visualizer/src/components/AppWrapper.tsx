'use client';

import React from 'react';
import { tss } from 'tss-react/mui';

export function AppWrapper(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const { classes } = useStyles();

  return <div className={classes.root}>{children}</div>;
}

const useStyles = tss.create(() => ({
  root: { display: 'flex', minHeight: '100vh', flex: 1 },
}));
