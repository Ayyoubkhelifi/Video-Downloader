import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow thumbnails from any external domain
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
};

export default nextConfig;
