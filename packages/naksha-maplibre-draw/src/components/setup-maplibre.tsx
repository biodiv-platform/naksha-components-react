import type { Map as MaplibreMap } from "maplibre-gl";

export async function setupMaplibreMap({
  containerId,
  latitude = 0,
  longitude = 0,
  zoom,
  pitch,
  bearing,
  mapstyle,
  workerUrl,
}: {
  containerId: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  mapstyle?: string;
  workerUrl?: string;
}): Promise<MaplibreMap> {
  const { getRTLTextPluginStatus, Map, setRTLTextPlugin, config } =
    await import("maplibre-gl");

  if (workerUrl) {
    config.WORKER_URL = workerUrl;
  } else if (!config.WORKER_URL) {
    config.WORKER_URL = "/maplibre-gl-worker.mjs";
  }

  if (getRTLTextPluginStatus() === "unavailable") {
    setRTLTextPlugin(
      "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
      true
    );
  }

  return new Map({
    container: containerId,
    style: mapstyle,
    center: { lat: latitude, lng: longitude },
    zoom,
    pitch,
    bearing,
  });
}
