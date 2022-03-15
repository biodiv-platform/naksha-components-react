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
  const [features, setFeatures] = useState<any[]>(props.features || []);

  const autoFocus = () => {
    if (!features?.length || !mapv) return;

    const _bbox = bbox({ type: "FeatureCollection", features });
    mapv.fitBounds(_bbox as any, { padding: 40, duration: 1000 });
  };

  useEffect(() => {
    props.onFeaturesChange && props.onFeaturesChange(features);

    autoFocus();
  }, [features]);

  useEffect(() => {
    if (
      props.isControlled &&
      JSON.stringify(features) !== JSON.stringify(props.features)
    ) {
      setFeatures(props.features || []);
    }
  }, [props.features]);

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
      <NavControl position="bottom-right" showZoom={true} showCompass={true} />
      <DrawControl
        features={features}
        setFeatures={setFeatures}
        isControlled={props.isControlled}
        isMultiple={props.isMultiple}
      />
      <GeojsonLayer features={features} />
    </MapGL>
  );
}
