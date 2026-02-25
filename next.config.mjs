import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclure les binaires natifs .node
    config.module.rules.push({
      test: /\.node$/,
      use: "ignore-loader",
    });

    // Résoudre onnxruntime-node comme vide (on utilise onnxruntime-web via @xenova/transformers)
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    };

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["onnxruntime-node", "sharp"],
  },
};

export default withPWA(nextConfig);
