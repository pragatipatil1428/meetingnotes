import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /*
   * Enable React strict mode for development.
   * This is already the default in Next.js 15+.
   */
  reactStrictMode: true,
  /*
   * Configure logging for production.
   */
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
