'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React, { useEffect, useMemo } from 'react';

import { useAppStore } from '@/store/appStore';
import { darkTheme, lightTheme } from '@/styles/theme';

export type AppProvidersProps = React.PropsWithChildren;

export function ClientSideProviders({ children }: AppProvidersProps) {
  const { themeMode, setThemeMode } = useAppStore();

  const theme = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  // initial render theme mode sync
  useEffect(() => {
    setThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }, [setThemeMode]);

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <CssBaseline />

        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
}
