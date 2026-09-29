import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["movie-bobsled-oxidant.ngrok-free.dev"],
  async rewrites() {
    return [
      {
        source: "/api/v2/:path*",
        destination: "http://localhost:3000/api/v2/:path*",
      },
    ];
  },
};

export default nextConfig;