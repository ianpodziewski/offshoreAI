/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add better-sqlite3 to non-bundleable dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        crypto: false,
        net: false,
        tls: false,
        os: false,
        'better-sqlite3': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 