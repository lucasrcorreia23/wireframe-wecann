import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Evita addons não transpilados do ecossistema three (drei/postprocessing).
  transpilePackages: ["three"],
  // Há um lockfile no diretório-pai; fixa a raiz neste projeto.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
