import React, { useEffect, useMemo } from "react";
import { Layer, Source } from "react-map-gl";

import useLayers from "../../../../hooks/use-layers";
import { PROPERTY_ID } from "../../../../static/constants";

const paint = {
  fill: {
    "line-color": "red",
    "line-width": 2,
  },
  circle: {
    "circle-stroke-color": "red",
    "circle-stroke-width": 2,
    "circle-opacity": 0,
  },
};

export default function VectorLayer({ layer: data, beforeId }) {
  const { layer } = useLayers();

  const layerProps = useMemo(
    () => data.data?.styles?.[data.data?.styleIndex]?.colors,
    [data, layer.selectedFeatures]
  );

  const highlightData = layer.selectedFeaturesId?.[data.id];

  return (
    <Source {...data.source}>
      {layerProps && <Layer beforeId={beforeId} {...layerProps} />}

      {/*
       * Highlighted Layer Styles
       * We are changing type to `line` from `fill` since `fill` can't have stroke more then 1px due to GL limitations
       * reference: https://github.com/mapbox/mapbox-gl-js/issues/3018#issuecomment-240381965
       */}
      {highlightData && layerProps && (
        <Layer
          {...layerProps}
          beforeId={beforeId}
          id={`hl_${data.id}`}
          filter={["in", PROPERTY_ID, ...highlightData]}
          type={layerProps.type === "fill" ? "line" : layerProps.type}
          paint={paint[layerProps.type]}
        />
      )}
    </Source>
  );
}
