import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds (run separately via pnpm lint)
    // Next.js 15 has compatibility issues with flat config (eslint.config.js)
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['getmytestdrive.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days (reduced from 1 year per PR #28 audit)
  },
  // Performance optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header (security + performance)
  reactStrictMode: true, // Enable strict mode for better performance warnings
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Exclude jscanify from server-side bundle (has Node.js dependencies)
    if (isServer) {
      config.externals = [...(config.externals || []), 'jscanify'];
    } else {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Redirects for old booking routes
  redirects: async () => [
    {
      source: '/:locale/bookings/step:num(1|2|3)',
      destination: '/:locale/bookings/new',
      permanent: true,
    },
  ],
};

export default withBundleAnalyzer(
  withSentryConfig(nextConfig, {
    org: "hex-org",
    project: "hex-test-drive-man",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  })
);
