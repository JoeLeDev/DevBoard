import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garder les vérifications strictes pour la qualité du code
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
