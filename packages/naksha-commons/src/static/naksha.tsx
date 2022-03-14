export enum MapStyles {
  MAP_STREETS = "0",
  MAP_SATELLITE = "1",
  MAP_DARK = "2",
  MAP_OSM = "3",
}

export const defaultViewState = {
  latitude: 22.5,
  longitude: 79,
  zoom: 3,
  bearing: 0,
  pitch: 0,
};

export const defaultMapStyles = [
  {
    text: "Streets",
    key: MapStyles.MAP_STREETS,
    style: "mapbox://styles/biodiv/cku4aoj5k1g9h17o5r3tjsntn",
  },
  {
    text: "Satellite",
    key: MapStyles.MAP_SATELLITE,
    style: "mapbox://styles/biodiv/cku49ca8q1esz18o7gxfjmh5r",
  },
  {
    text: "Dark",
    key: MapStyles.MAP_DARK,
    style: "mapbox://styles/biodiv/cku4a35961fgo17mykoq76se1",
  },
  {
    text: "OSM",
    key: MapStyles.MAP_OSM,
    style:
      "https://unpkg.com/maplibre-gl-styles@0.0.1/styles/osm-mapnik/v8/india.json",
  },
];

export const adminBoundries = [
  "admin-0-boundary",
  "admin-1-boundary",
  "admin-0-boundary-disputed",
  "admin-1-boundary-bg",
  "admin-0-boundary-bg",
];
