import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/voice-:roomCode',
        destination: '/voice/:roomCode',
      },
    ];
  },
};

export default nextConfig;
