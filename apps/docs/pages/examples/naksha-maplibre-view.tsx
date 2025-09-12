import "maplibre-gl/dist/maplibre-gl.css";
import { NakshaMaplibreView } from "@biodiv-platform/naksha-maplibre-view";

import React from "react";
import { tw } from "twind";

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [78, 30],
      },
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72, 20],
            [79, 20],
            [79, 24],
            [72, 24],
            [72, 20],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [76.5527, 29.1137],
          [79.7167, 17.7696],
        ],
      },
    },
  ],
};

const mapStyles = [
  {
    text: "OSM",
    key: "0",
    style:
      "https://unpkg.com/maplibre-gl-styles@0.0.1/styles/osm-mapnik/v8/india.json",
  },
  {
    text: "Satellite",
    key: "1",
    style:
      "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",
    maxZoom: 15.9,
  },
];
export default function NakshaMaplibreViewPage() {
  return (
    <div className={tw`h-[100vh] w-[100vw]`}>
      <NakshaMaplibreView data={geojson} mapStyles={mapStyles} />
    </div>
  );
}
