import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //require this or run to unhandled runtime error: Invalid src prop (https://www.example.com/apartment1_1.jpg)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
