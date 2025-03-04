/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only apply this for the server build
    if (isServer) {
      // In case config.externals doesn't exist, spread it into an array
      config.externals = [...(config.externals || []), "pdf-parse"];
    }
    return config;
  },
};

export default nextConfig;
