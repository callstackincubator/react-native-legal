import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: '../license-kit/visualizer-build',
  output: 'standalone',
  turbopack: {
    rules: {
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
