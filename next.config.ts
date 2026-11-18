import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Bound build concurrency on local workstations and small CI runners.
    cpus: 2,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
