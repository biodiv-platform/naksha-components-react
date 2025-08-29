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

export default function NakshaMaplibreViewPage() {
  return (
    <div className={tw`h-[100vh] w-[100vw]`}>
      <NakshaMaplibreView data={geojson} />
    </div>
  );
}
