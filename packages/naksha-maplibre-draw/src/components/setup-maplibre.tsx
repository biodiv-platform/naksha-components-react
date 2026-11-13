import type { Map as MaplibreMap } from "maplibre-gl";

let cachedWorkerUrlPromise: Promise<string> | null = null;

export async function setupMaplibreMap({
  container,
  containerId = "maplibre-map",
  latitude = 0,
  longitude = 0,
  zoom,
  pitch,
  bearing,
  mapstyle,
  workerUrl,
}: {
  container?: HTMLElement | string;
  containerId?: string;
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
    if (typeof window !== "undefined") {
      if (!cachedWorkerUrlPromise) {
        cachedWorkerUrlPromise = (async () => {
          try {
            const res = await fetch("/maplibre-gl-worker.mjs", { method: "HEAD" });
            const contentType = res.headers.get("content-type") || "";
            if (res.ok && !contentType.includes("text/html")) {
              return "/maplibre-gl-worker.mjs";
            }
          } catch {}
          return "https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl-worker.mjs";
        })();
      }
      config.WORKER_URL = await cachedWorkerUrlPromise;
    }
  }

  if (getRTLTextPluginStatus() === "unavailable") {
    setRTLTextPlugin(
      "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
      true
    );
  }

  return new Map({
    container: container || containerId,
    style: mapstyle,
    center: { lat: latitude, lng: longitude },
    zoom,
    pitch,
    bearing,
  });
}
