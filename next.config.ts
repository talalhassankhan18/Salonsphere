import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  redirects: async () => [
    {
      source: "/about",
      destination: "/",
      permanent: true,
    },
    {
      // Several pages still link to /login, which no longer exists.
      source: "/login",
      destination: "/auth/signin",
      permanent: false,
    },
    {
      // Salon onboarding has no index page; start at step 1.
      source: "/salon/register",
      destination: "/salon/register/basic-info",
      permanent: false,
    },
    {
      source: "/blog/:slug",
      destination: "/news/:slug",
      permanent: true,
    },
  ],
};

export default nextConfig;
