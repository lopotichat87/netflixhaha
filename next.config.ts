import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
    optimisticClientCache: true,
  },
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimisations pour le build et navigation rapide
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  // Précharger les pages pour navigation instantanée
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
