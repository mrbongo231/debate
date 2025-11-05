import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
  },
  // INJECTED-BY-STUDIO
  // This is required for Studio to function correctly.
  // Do not remove this configuration.
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.cluster-ocv3ypmyqfbqysslgd7zlhmxek.cloudworkstations.dev',
      ],
    },
  },
};

export default nextConfig;
