import type { NextConfig } from "next";

export default {
  output: 'export',
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
} as NextConfig;