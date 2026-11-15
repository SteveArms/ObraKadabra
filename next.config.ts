import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev indicator overlaps the mobile bottom nav and intercepts clicks in e2e
  devIndicators: process.env.E2E ? false : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
