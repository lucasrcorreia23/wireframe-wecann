import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita addons não transpilados do ecossistema three (drei/postprocessing).
  transpilePackages: ["three"],
};

export default nextConfig;
