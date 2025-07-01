'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React from 'react';

import { theme } from '@/styles/theme';

export type AppProvidersProps = React.PropsWithChildren;

export function ClientSideProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <CssBaseline />

        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
}
