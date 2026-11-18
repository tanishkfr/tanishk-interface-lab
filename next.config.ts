import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Bound build concurrency on local workstations and small CI runners.
    cpus: 2,
    webpackBuildWorker: false,
  },
  async redirects() {
    return [
      { source: "/products", destination: "/software", permanent: true },
      {
        source: "/products/:path*",
        destination: "/software/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
