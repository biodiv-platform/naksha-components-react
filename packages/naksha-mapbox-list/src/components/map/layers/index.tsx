import React from "react";
import { useMap } from "react-map-gl";
import { GeoserverLayer } from "../../../interfaces";
import GridLayer from "./grid";
import VectorLayer from "./vector";
import RasterLayer from "./raster";

export function MapLayer({
  layer,
  beforeId,
}: {
  layer: GeoserverLayer;
  beforeId?;
}) {
  const { mapl } = useMap();

  if (!mapl) {
    return null;
  }

  switch (layer.source.type) {
    case "vector":
      return <VectorLayer beforeId={beforeId} layer={layer} />;

    case "grid":
      return <GridLayer beforeId={beforeId} data={layer} />;

    case "raster":
      return <RasterLayer beforeId={beforeId} data={layer} />;

    default:
      return <VectorLayer beforeId={beforeId} layer={layer} />;
  }
}
