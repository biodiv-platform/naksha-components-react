export enum BaseLayer {
  MAP_STREETS = "0",
  MAP_SATELLITE = "1",
  MAP_DARK = "2",
  MAP_OSM = "3",
}

export const defaultViewPort = {
  latitude: 20,
  longitude: 79,
  zoom: 3,
  bearing: 0,
  pitch: 0,
  maxZoom: 14,
};

const osmStyle = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: ["https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a> contributors.',
    },
  },
  layers: [
    {
      id: "simple-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export const defaultMapStyles = [
  {
    text: "Streets",
    key: BaseLayer.MAP_STREETS,
    style: "mapbox://styles/mapbox/streets-v11?optimize=true",
  },
  {
    text: "Satellite",
    key: BaseLayer.MAP_SATELLITE,
    style: "mapbox://styles/mapbox/satellite-streets-v11?optimize=true",
  },
  {
    text: "Dark",
    key: BaseLayer.MAP_DARK,
    style: "mapbox://styles/mapbox/dark-v10?optimize=true",
  },
  {
    text: "OSM",
    key: BaseLayer.MAP_OSM,
    style: osmStyle,
  },
];

export const adminBoundries = [
  "admin-0-boundary",
  "admin-1-boundary",
  "admin-0-boundary-disputed",
  "admin-1-boundary-bg",
  "admin-0-boundary-bg",
];
