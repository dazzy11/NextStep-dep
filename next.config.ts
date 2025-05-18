import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.ytimg.com"],
  },
  // If you *need* to customize Turbopack (rare), use the top-level `turbopack` key:
  // turbopack: { /* …custom transforms/resolutions… */ },
};

export default nextConfig;
