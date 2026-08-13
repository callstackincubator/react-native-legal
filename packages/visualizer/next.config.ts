import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: '../license-kit/visualizer-build',
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
