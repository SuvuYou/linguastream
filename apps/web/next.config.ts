import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // transpilePackages: ["plyr"], TODO: Check if this is needed after building
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8096",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
