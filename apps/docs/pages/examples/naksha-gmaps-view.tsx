import { NakshaGmapsView } from "@biodiv-platform/naksha-gmaps-view";
import React from "react";

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

export default function NakshaGmapsViewPage() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <NakshaGmapsView
        gmapAccessToken={process.env.STORYBOOK_GMAP_TOKEN}
        features={geojson}
        // Restricts autocomplete + customization searches to India
        gmapRegion="IN"
      />
    </div>
  );
}
