import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `node:` protocol
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      };
      
      // Add a resolve alias for node: protocol
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:crypto': require.resolve('crypto-browserify'),
      };
    }
    return config;
  },
};

export default nextConfig;
