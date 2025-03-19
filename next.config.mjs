/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['placehold.it', 'via.placeholder.com', 'firebasestorage.googleapis.com'],
  },
  // Add proper API route configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Ensure correct environment variables are loaded
  env: {
    VERCEL_KV_URL: process.env.VERCEL_KV_URL || process.env.REDIS_URL,
    VERCEL_KV_REST_API_URL: process.env.VERCEL_KV_REST_API_URL,
    VERCEL_KV_REST_API_TOKEN: process.env.VERCEL_KV_REST_API_TOKEN,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'offshoreai'
  },
  webpack: (config, { isServer }) => {
    // Only apply this for the server build
    if (isServer) {
      // In case config.externals doesn't exist, spread it into an array
      config.externals = [...(config.externals || []), "pdf-parse"];
    }
    
    // Handle Node.js modules used by ioredis
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
