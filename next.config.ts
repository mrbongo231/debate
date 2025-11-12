
import {config} from 'dotenv';
config();

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
  // INJECTED-BY-STUDIO
  // This is required for Studio to function correctly.
  // Do not remove this configuration.
  experimental: {
    allowedDevOrigins: ["*.cluster-ocv3ypmyqfbqysslgd7zlhmxek.cloudworkstations.dev"],
    serverActions: {
      allowedForwardedHosts: [
        '*.cluster-ocv3ypmyqfbqysslgd7zlhmxek.cloudworkstations.dev',
        '*.github.dev',
        '*.app.github.dev',
      ],
      allowedOrigins: [
        'localhost:9002',
        '*.cluster-ocv3ypmyqfbqysslgd7zlhmxek.cloudworkstations.dev',
        '*.github.dev',
        '*.app.github.dev',
      ]
    },
  },
};

export default nextConfig;
