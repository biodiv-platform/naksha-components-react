import { defaultViewPort } from "@ibp/naksha-commons";
import React from "react";

import { NakshaMapboxView } from "../src";

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

export const ExampleStory = () => (
  <NakshaMapboxView
    defaultViewPort={defaultViewPort}
    mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_TOKEN || "pk.xyz"}
    data={geojson}
  />
);

const meta = {
  title: "@ibp/naksha-mapbox-view",
  component: NakshaMapboxView,
};

export default meta;
