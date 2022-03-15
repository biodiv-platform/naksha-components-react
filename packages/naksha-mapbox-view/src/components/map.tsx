import { defaultMapStyles, defaultViewState } from "@ibp/naksha-commons";
import React, { useEffect, useState } from "react";
import MapGL, { Layer, NavigationControl, Source, useMap } from "react-map-gl";

import { NakshaMapboxViewProps } from "../interfaces";
import { featureStyle, lineStyle, pointStyle } from "../static/constants";
import bbox from "@turf/bbox";

const NavControl: any = NavigationControl;

export default function Map(props: NakshaMapboxViewProps) {
  const { mapv } = useMap();
  const [mapStyle] = useState(defaultMapStyles[props?.mapStyle || 0].style);
  const [viewState] = useState(props.defaultViewState || defaultViewState);

  const onDataChange = () => {
    if (!props.data || !mapv) return;

    const _bbox = bbox(props.data);
    mapv.fitBounds(_bbox as any, { padding: 40, duration: 1000 });
  };

  useEffect(() => {
    onDataChange();
  }, [props.data]);

  return (
    <MapGL
      id="mapv"
      cursor="default"
      initialViewState={viewState}
      mapboxAccessToken={props.mapboxAccessToken}
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
    </MapGL>
  );
}
