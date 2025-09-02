import maplibregl from "maplibre-gl";

export function setupMaplibreMap({
  containerId,
  latitude = 0,
  longitude = 0,
  zoom,
  pitch,
  bearing,
  mapstyle,
}: {
  containerId: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  mapstyle?: string;
}) {
  if (maplibregl.getRTLTextPluginStatus() === "unavailable") {
    maplibregl.setRTLTextPlugin(
      "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
      true
    );
  }

  return new maplibregl.Map({
    container: containerId,
    style: mapstyle,
    center: { lat: latitude, lng: longitude },
    zoom,
    pitch,
    bearing,
  });
}
