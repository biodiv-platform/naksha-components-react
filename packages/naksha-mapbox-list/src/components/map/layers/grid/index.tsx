import React, { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import useLayers from "../../../../hooks/use-layers";

import { GeoserverLayer } from "../../../../interfaces";
import { getGridLayerData } from "../../../../services/naksha";

export default function GridLayer({
  data,
  beforeId,
}: {
  data: GeoserverLayer;
  beforeId?;
}) {
  const { layer } = useLayers();
  const { mapl } = useMap();
  const [layerData, setLayerData] = useState<any>({ geojson: {}, paint: {} });

  const fetchGridData = async () => {
    const { success, geojson, paint, stops, squareSize } =
      await getGridLayerData(
        data.source.fetcher,
        mapl?.getBounds(),
        mapl?.getZoom()
      );

    if (success) {
      setLayerData({ geojson, paint });
      layer.setGridLegends({
        [data.id]: { stops, squareSize },
      });
    }
  };

  useEffect(() => {
    mapl?.on("idle", fetchGridData);
  }, []);

  return (
    <Source id={data.id} type="geojson" data={layerData.geojson}>
      <Layer
        beforeId={beforeId}
        id={data.id}
        type="fill"
        paint={layerData.paint}
      />
    </Source>
  );
}
