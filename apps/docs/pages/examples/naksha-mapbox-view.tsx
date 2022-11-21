import "mapbox-gl/dist/mapbox-gl.css";

import { NakshaMapboxView } from "@biodiv-platform/naksha-mapbox-view";
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

export default function NakshaMapboxViewPage() {
  return (
    <div className={tw`h-[100vh] w-[100vw]`}>
      <NakshaMapboxView
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        data={geojson}
      />
    </div>
  );
}
