/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `node:` protocol
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        fs: false,
        path: false,
        os: false,
      };
      
      // Add a resolve alias for node: protocol
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:crypto': require.resolve('crypto-browserify'),
        'node:fs': false,
        'node:path': false,
        'node:os': false,
      };
    }
    
    // Handle node: prefix in all webpack resolver modes
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /node_modules[/\\]drizzle-orm[/\\].*\.js$/,
          resolve: {
            fallback: {
              'node:crypto': require.resolve('crypto-browserify'),
              'node:fs': false,
              'node:path': false,
              'node:os': false,
            }
          }
        }
      ]
    };
    
    // This is needed for SQLite native modules in a Next.js environment
    config.externals.push('better-sqlite3');
    
    return config;
  },
  // Tell Next.js to ignore these node modules during client side rendering
  transpilePackages: ['drizzle-orm'],
};

module.exports = nextConfig; 