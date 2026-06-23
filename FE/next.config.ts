import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // typescript.ignoreBuildErrors intentionally left off so type errors
  // fail the build instead of shipping silently to production.
  logging: {
    // Dev-only: avoid logging every client navigation as GET in the terminal.
    incomingRequests: false,
    // Dev-only: forward real errors; skip warn noise (LCP hints, RTK perf).
    browserToTerminal: "error",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
