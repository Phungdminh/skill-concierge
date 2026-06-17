import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['192.168.55.14'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    // Baseline hardening applied to every response. CSP is intentionally
    // omitted for now — a strict policy needs testing against Next's inline
    // scripts and framer-motion to avoid blank-screening production.
    return [
      {
        source: '/:path*',
        headers: [
          // Clickjacking: don't allow the site (esp. /admin) to be framed.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Stop MIME sniffing of responses into executable types.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak full URLs (with query) to third-party origins.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Deny powerful browser features the app doesn't use.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Force HTTPS for 2 years incl. subdomains (no-op over plain HTTP).
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
