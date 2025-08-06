import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';

import { AppWrapper } from '@/components/AppWrapper';
import { ClientSideProviders } from '@/providers/ClientSideProviders';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'License Kit Visualizer',
  description: 'License Kit Project Visualizer & Analyzer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppRouterCacheProvider>
          <ClientSideProviders>
            <AppWrapper>{children}</AppWrapper>
          </ClientSideProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
