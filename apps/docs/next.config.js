/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "naksha-components-react",
    "@biodiv-platform/dummy",
    "@biodiv-platform/naksha-commons",
    "@biodiv-platform/naksha-gmaps-draw",
    "@biodiv-platform/naksha-gmaps-view",
    "@biodiv-platform/naksha-mapbox-draw",
    "@biodiv-platform/naksha-mapbox-list",
    "@biodiv-platform/naksha-mapbox-view",
    "@biodiv-platform/naksha-maplibre-draw",
    "@biodiv-platform/naksha-maplibre-layers",
    "@biodiv-platform/naksha-maplibre-view",
  ],
};

export default nextConfig;
