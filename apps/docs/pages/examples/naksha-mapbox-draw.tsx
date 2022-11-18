import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import { NakshaMapboxDraw } from "@biodiv-platform/naksha-mapbox-draw";
import React, { useState } from "react";
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

const changedGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.5966796875, 16.678293098288513],
            [85.2978515625, 16.678293098288513],
            [85.2978515625, 20.96143961409684],
            [76.5966796875, 20.96143961409684],
            [76.5966796875, 16.678293098288513],
          ],
        ],
      },
    },
  ],
};

export default function NakshaMapboxDrawPage() {
  const [controlled, setControlled] = useState(false);
  const [multiple, setMultiple] = useState(false);
  const [data, setData] = useState(geojson.features);

  return (
    <div className={tw`h-[100vh] w-[100vw]`}>
      <NakshaMapboxDraw
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        features={data}
        onFeaturesChange={setData}
        isControlled={controlled}
        isMultiple={multiple}
      />
      <div
        className={tw`absolute top-3 right-12 bg-white rounded p-4 shadow-md`}
      >
        <label>
          <input type="checkbox" onChange={() => setControlled(!controlled)} />
          Controlled {JSON.stringify(controlled)}
        </label>
        <br />
        <label>
          <input type="checkbox" onChange={() => setMultiple(!multiple)} />
          Multiple {JSON.stringify(multiple)}
        </label>
        <br />
        <button onClick={() => setData(changedGeojson.features)}>
          Change GeoJSON
        </button>
      </div>
    </div>
  );
}
