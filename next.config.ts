
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
        protocol: 'http',
        hostname: '148.72.244.169',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: '/api/v1/:path*',
        destination: `http://148.72.244.169:3000/api/v1/:path*`,
      },
    ]
  },
};

export default nextConfig;
