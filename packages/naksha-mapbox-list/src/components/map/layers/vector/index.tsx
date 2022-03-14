import React, { useEffect, useMemo } from "react";
import { Layer, Source } from "react-map-gl";

import useLayers from "../../../../hooks/use-layers";
import { PROPERTY_ID } from "../../../../static/constants";

const paint = {
  fill: {
    "fill-outline-color": "red",
    "fill-color": "transparent",
    "fill-opacity": 1,
  },
  circle: {
    "circle-stroke-color": "red",
    "circle-stroke-width": 1,
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

  useEffect(() => {
    if (!layerProps) {
      layer.toggle({ layerId: data.id, add: true, focus: false });
    }
  }, [layerProps]);

  return layerProps ? (
    <Source {...data.source}>
      <Layer beforeId={beforeId} {...layerProps} />
      {highlightData && ( // Highlighted Layer Styles
        <Layer
          {...layerProps}
          beforeId={beforeId}
          id={`hl_${data.id}`}
          filter={["in", PROPERTY_ID, ...highlightData]}
          paint={paint[layerProps.type]}
        />
      )}
    </Source>
  ) : null;
}
