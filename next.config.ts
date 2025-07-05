
import type {NextConfig} from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const apiURL = new URL(API_BASE_URL);

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
        protocol: apiURL.protocol.replace(':', ''),
        hostname: apiURL.hostname,
        port: apiURL.port,
        pathname: '/**',
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_BASE_URL}/api/v1/:path*`,
      },
      {
        source: '/api/location/:path*',
        destination: `${API_BASE_URL}/api/location/:path*`,
      },
    ]
  },
};

export default nextConfig;
