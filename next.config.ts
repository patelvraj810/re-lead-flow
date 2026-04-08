import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for Vercel builds since Turbopack isn't supported there yet
  // (Turbopack is used automatically in dev via next dev --turbopack)
};

export default nextConfig;
