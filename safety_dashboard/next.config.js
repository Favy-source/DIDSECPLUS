/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not fail the build on ESLint or TypeScript errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Custom webpack configuration
  webpack(config) {
    // Exclude SVGs from Next's built‑in image loader
    const imageRule = config.module.rules.find(
      (rule) => rule?.test?.test?.('.svg'),
    );
    if (imageRule) {
      imageRule.exclude = /\.svg$/i;
    }

    // Use SVGR so `import Icon from './icon.svg'` becomes a React component
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/, // only process SVGs imported from TS/JS files
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Rewrite /api requests to your backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // During local development this forwards to your backend on port 3000.
        // In production, update this to point at your hosted Rust API endpoint.
        destination: 'https://didsecplus-backend.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
