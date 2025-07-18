'use client';

import { theme } from '@/styles/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React from 'react';

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
