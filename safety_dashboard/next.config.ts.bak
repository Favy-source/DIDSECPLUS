import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  webpack(config) {
    // Exclude SVGs from Next's built-in asset loader
    const imageRule = config.module.rules.find(
      // Find the rule that tests for .svg
      // (Next groups images together; this catches it safely)
      // @ts-ignore
      (rule) => rule?.test?.test?.(".svg")
    );
    if (imageRule) {
      // @ts-ignore
      imageRule.exclude = /\.svg$/i;
    }

    // Use SVGR so `import Icon from './icon.svg'` becomes a React component
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,         // only when importing from TS/JS files
      use: ["@svgr/webpack"],
    });

    return config;
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
