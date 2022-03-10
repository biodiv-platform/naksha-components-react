import { defaultMapStyles, defaultViewState } from "@ibp/naksha-commons";
import bbox from "@turf/bbox";
import React, { useEffect, useState } from "react";
import MapGL, { NavigationControl, useMap } from "react-map-gl";

import { NakshaMapboxViewProps } from "../interfaces";
import DrawControl from "./draw-control";
import GeojsonLayer from "./geojson-layer";

const NavControl: any = NavigationControl;

export default function Map(props: NakshaMapboxViewProps) {
  const { mapv } = useMap();
  const [mapStyle] = useState(defaultMapStyles[props?.mapStyle || 0].style);
  const [viewState] = useState(props.defaultViewState || defaultViewState);

  const autoFocus = () => {
    if (!props.data?.features?.length || !mapv) return;

    const _bbox = bbox(props.data);
    mapv.fitBounds(_bbox as any, { padding: 40, duration: 1000 });
  };

  useEffect(() => {
    autoFocus();
  }, [props.data]);

  return (
    <MapGL
      id="mapv"
      cursor="default"
      initialViewState={viewState}
      mapboxAccessToken={props.mapboxAccessToken}
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      onLoad={autoFocus}
    >
      <NavControl position="top-right" showZoom={true} showCompass={true} />
      <DrawControl
        data={props.data}
        onDataChange={props.onDataChange}
        isControlled={props.isControlled}
        isMultiple={props.isMultiple}
        autoFocus={autoFocus}
      />
      <GeojsonLayer data={props.data} />
    </MapGL>
  );
}
