import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow loading and optimizing remote images over http/https.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
