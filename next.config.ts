import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Corrected placement
    },
  },
  redirects: async () => [
    {
      source: "/about",
      destination: "/",
      permanent: true,
    },
    {
      source: "/blog/:slug",
      destination: "/news/:slug",
      permanent: true,
    },
  ],
};

export default nextConfig;
