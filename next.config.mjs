/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["app"],
  output: 'standalone',
  images: {
    domains: [
      "images.unsplash.com",
      "cloudflare-ipfs.com",
      "avatars.githubusercontent.com",
      "githubusercontent.com",
      "github.com",
    ],
  },
  // Skip TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Properly configured experimental options
  experimental: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.globalObject = 'self';
      
      // Handle node: protocol imports
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: false,
        crypto: false,
        path: false,
        fs: false,
        os: false,
        http: false,
        https: false,
      };
    }
    return config;
  },
};

export default nextConfig; 