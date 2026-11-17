import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image Docker légère : seul le serveur autonome et les fichiers utilisés partent en production.
  output: "standalone",
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Envoi d'images depuis l'administration : visuel + 4 images de galerie par enregistrement, 5 Mo chacune
    serverActions: { bodySizeLimit: "26mb" },
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
