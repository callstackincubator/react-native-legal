import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: '../visualizer-build',
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    return config;
  },
};

export default nextConfig;
