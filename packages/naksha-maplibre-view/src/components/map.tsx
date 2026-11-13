import {
  defaultMapStyles,
  defaultViewState,
} from "@biodiv-platform/naksha-commons";
import React, { useEffect, useState } from "react";
import MapGL, {
  Layer,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre";
import { config } from "maplibre-gl";

import { NakshaMaplibreViewProps } from "../interfaces";
import { featureStyle, lineStyle, pointStyle } from "../static/constants";
import bbox from "@turf/bbox";
import { MapStyleSwitcher } from "./selector";
import { initMaplibreWorker } from "../utils/setup-maplibre";

const NavControl: any = NavigationControl;

export default function Map(props: NakshaMaplibreViewProps) {
  const { mapv } = useMap();
  const [viewState] = useState(props.defaultViewState || defaultViewState);

  const [workerUrl, setWorkerUrl] = useState<string | undefined>(
    props.workerUrl ||
      (typeof window !== "undefined"
        ? config.WORKER_URL || "/maplibre-gl-worker.mjs"
        : undefined)
  );

  useEffect(() => {
    initMaplibreWorker(props.workerUrl).then(setWorkerUrl);
  }, [props.workerUrl]);

  const [selectedMapStyleIdx, setSelectedMapStyleIdx] = useState(
    props?.mapStyle || 0
  );

  const mapTile = props.mapStyles ? props.mapStyles : defaultMapStyles;
  const selectedMapTile = mapTile[selectedMapStyleIdx];
  const mapStyle = selectedMapTile?.style;
  const maxZoom = (selectedMapTile as any)?.maxZoom;

  const onDataChange = () => {
    if (!props.data || !mapv) return;

    try {
      const _bbox = bbox(props.data);
      if (_bbox.every(Number.isFinite)) {
        mapv.fitBounds(_bbox as any, { padding: 40, duration: 1000 });
      }
    } catch (e) {
      console.warn("Failed to compute bbox", e);
    }
  };

  useEffect(() => {
    onDataChange();
  }, [props.data]);

  const handleStyleChange = (idx: number) => {
    setSelectedMapStyleIdx(idx);
  };

  return (
    <MapGL
      id="mapv"
      workerUrl={workerUrl}
      cursor="default"
      initialViewState={viewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      maxZoom={maxZoom}
      onLoad={onDataChange}
    >
      <NavControl position="bottom-right" showZoom={true} showCompass={true} />
      {props.data && (
        <Source type="geojson" data={props.data}>
          <Layer {...pointStyle} />
          <Layer {...lineStyle} />
          <Layer {...featureStyle} />
        </Source>
      )}
      <MapStyleSwitcher
        currentStyleIdx={selectedMapStyleIdx}
        onStyleChange={handleStyleChange}
        mapStyles={mapTile}
      />
    </MapGL>
  );
}
