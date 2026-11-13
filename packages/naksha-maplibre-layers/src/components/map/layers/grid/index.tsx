import bbox from "@turf/bbox";
import React, { useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import useLayers from "../../../../hooks/use-layers";

import { GeoserverLayer } from "../../../../interfaces";
import { getGridLayerData } from "../../../../services/naksha";
import { getZoomConfig } from "../../../../utils/grid";

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
  const lastParamsRef = useRef<string>("");

  // Get current selection status
  const isSelected = layer.selectedIds.includes(data.id);
  const isLastSelected = layer.selectedIds[0] === data.id; // First = last selected

  // Fetch grid data
  const fetchGridData = async (shouldFitBounds = false) => {
    if (!mapl) return;
    const bounds = mapl.getBounds();
    const zoom = mapl.getZoom();
    if (!bounds) return;

    const [geoAggegationPrecision] = getZoomConfig(zoom);
    const { _ne, _sw } = bounds;
    const cacheKey = `${_ne.lat.toFixed(4)},${_sw.lng.toFixed(4)},${_sw.lat.toFixed(4)},${_ne.lng.toFixed(4)},${geoAggegationPrecision}`;

    if (cacheKey === lastParamsRef.current) {
      return;
    }
    lastParamsRef.current = cacheKey;

    const { success, geojson, paint, stops, squareSize } =
      await getGridLayerData(
        data.source.fetcher,
        bounds,
        zoom
      );

    if (success) {
      setLayerData({ geojson, paint });

      // Zoom to bounds only if this is the last selected layer
      if (shouldFitBounds && isLastSelected && data.zoomToFit) {
        try {
          const b = bbox(geojson as any);
          if (b.every(Number.isFinite)) {
            const [minLon, minLat, maxLon, maxLat] = b;
            mapl.fitBounds(
              [
                [minLon, minLat],
                [maxLon, maxLat],
              ],
              { padding: 40, animate: true }
            );
          }
        } catch (e) {
          console.warn("Failed to compute bbox", e);
        }
      }

      // Update legend
      layer.setGridLegends((prev) => ({
        ...prev,
        [data.id]: { stops, squareSize },
      }));
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

    const handleMoveEnd = () => fetchGridData(false);
    mapl.on("moveend", handleMoveEnd);

    return () => {
      mapl.off("moveend", handleMoveEnd);
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
