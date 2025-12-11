import bbox from "@turf/bbox";
import React, { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
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

  // Get current selection status
  const isSelected = layer.selectedIds.includes(data.id);
  const isLastSelected = layer.selectedIds[0] === data.id; // First = last selected

  // Fetch grid data
  const fetchGridData = async (shouldFitBounds = false) => {
    const { success, geojson, paint, stops, squareSize } =
      await getGridLayerData(
        data.source.fetcher,
        mapl?.getBounds(),
        mapl?.getZoom()
      );

    if (success) {
      setLayerData({ geojson, paint });

      // Zoom to bounds only if this is the last selected layer
      if (shouldFitBounds && isLastSelected && data.zoomToFit) {
        try {
          const [minLon, minLat, maxLon, maxLat] = bbox(geojson);
          mapl?.fitBounds(
            [
              [minLon, minLat],
              [maxLon, maxLat],
            ],
            { padding: 40, animate: true }
          );
        } catch (e) {
          console.warn("Failed to compute bbox", e);
        }
      }

      // Update legend
      layer.setGridLegends({
        [data.id]: { stops, squareSize },
      });
    }
  };

  // When layer becomes selected and is the last one, zoom to it
  useEffect(() => {
    if (isSelected && isLastSelected) {
      fetchGridData(true); // Fetch and zoom
    } else if (isSelected) {
      fetchGridData(false); // Fetch without zooming
    }
  }, [isSelected, isLastSelected]);

  // Refresh data on map movement when selected
  useEffect(() => {
    if (!isSelected || !mapl) return;

    const handleIdle = () => fetchGridData(false);
    mapl.on("idle", handleIdle);

    return () => {
      mapl.off("idle", handleIdle);
    };
  }, [isSelected, mapl]);

  // Cleanup
  useEffect(() => {
    return () => {
      layer.setGridLegends((prev) => {
        const newLegends = { ...prev };
        delete newLegends[data.id];
        return newLegends;
      });
    };
  }, [data.id]);

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
