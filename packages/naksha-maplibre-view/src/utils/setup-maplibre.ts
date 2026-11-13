import { config } from "maplibre-gl";

export const DEFAULT_MAPLIBRE_WORKER_FALLBACK =
  "https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl-worker.mjs";

if (typeof window !== "undefined" && !config.WORKER_URL) {
  config.WORKER_URL = "/maplibre-gl-worker.mjs";
}

let cachedWorkerUrlPromise: Promise<string> | null = null;

export async function initMaplibreWorker(workerUrl?: string): Promise<string> {
  if (workerUrl) {
    config.WORKER_URL = workerUrl;
    return workerUrl;
  }
  if (
    config.WORKER_URL &&
    config.WORKER_URL !== "/maplibre-gl-worker.mjs"
  ) {
    return config.WORKER_URL;
  }
  if (typeof window === "undefined") {
    return "";
  }
  if (cachedWorkerUrlPromise) {
    return cachedWorkerUrlPromise;
  }

  cachedWorkerUrlPromise = (async () => {
    try {
      const res = await fetch("/maplibre-gl-worker.mjs", { method: "HEAD" });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && !contentType.includes("text/html")) {
        config.WORKER_URL = "/maplibre-gl-worker.mjs";
        return "/maplibre-gl-worker.mjs";
      }
    } catch {}

    config.WORKER_URL = DEFAULT_MAPLIBRE_WORKER_FALLBACK;
    return DEFAULT_MAPLIBRE_WORKER_FALLBACK;
  })();

  return cachedWorkerUrlPromise;
}
