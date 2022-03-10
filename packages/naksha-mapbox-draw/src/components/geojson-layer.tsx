import React from "react";
import { Layer, Source } from "react-map-gl";

import { featureStyle, lineStyle, pointStyle } from "../static/constants";

export default function GeojsonLayer({ data }) {
  if (!data?.features?.length) return null;

  return (
    <Source type="geojson" data={data}>
      <Layer {...pointStyle} />
      <Layer {...lineStyle} />
      <Layer {...featureStyle} />
    </Source>
  );
}
