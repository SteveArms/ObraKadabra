import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // AI_MODEL=fixture answers from these files, so the deployed route must ship them
  outputFileTracingIncludes: {
    "/api/plano": ["./e2e/fixtures/plano-*.json"],
  },
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
