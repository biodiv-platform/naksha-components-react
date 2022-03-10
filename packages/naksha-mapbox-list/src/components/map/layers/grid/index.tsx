import React, { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";

import { GeoserverLayer } from "../../../../interfaces";
import { getGridLayerData } from "../../../../services/naksha";

export default function GridLayer({
  layer,
  beforeId,
}: {
  layer: GeoserverLayer;
  beforeId?;
}) {
  const { mapl } = useMap();
  const [layerData, setLayerData] = useState<any>({ geojson: {}, paint: {} });

  const fetchGridData = async () => {
    const { success, geojson, paint, stops, squareSize } =
      await getGridLayerData(
        layer.source.fetcher,
        mapl.getBounds(),
        mapl.getZoom()
      );

    if (success) {
      setLayerData({ geojson, paint });
    }
  };

  useEffect(() => {
    mapl.on("idle", fetchGridData);
  }, []);

  return (
    <Source id={layer.id} type="geojson" data={layerData.geojson}>
      <Layer
        beforeId={beforeId}
        id={layer.id}
        type="fill"
        paint={layerData.paint}
      />
    </Source>
  );
}
