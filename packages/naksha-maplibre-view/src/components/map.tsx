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

import { NakshaMaplibreViewProps } from "../interfaces";
import { featureStyle, lineStyle, pointStyle } from "../static/constants";
import bbox from "@turf/bbox";
import { MapStyleSwitcher } from "./selector";

const NavControl: any = NavigationControl;

export default function Map(props: NakshaMaplibreViewProps) {
  const { mapv } = useMap();
  const [viewState] = useState(props.defaultViewState || defaultViewState);

  const [selectedMapStyleIdx, setSelectedMapStyleIdx] = useState(
    props?.mapStyle || 0
  );

  const mapTile = props.mapStyles ? props.mapStyles : defaultMapStyles;
  const mapStyle = mapTile[selectedMapStyleIdx]?.style;

  const onDataChange = () => {
    if (!props.data || !mapv) return;

    const _bbox = bbox(props.data);
    mapv.fitBounds(_bbox as any, { padding: 40, duration: 1000 });
  };

  useEffect(() => {
    onDataChange();
  }, [props.data]);

  const handleStyleChange = (idx) => {
    setSelectedMapStyleIdx(idx);
  };

  return (
    <MapGL
      id="mapv"
      cursor="default"
      initialViewState={viewState}
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
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
