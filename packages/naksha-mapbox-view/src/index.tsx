import {
  BaseLayer,
  defaultMapStyles,
  defaultViewPort as dv,
  updateWorldViewRef,
} from "@ibp/naksha-commons";
import bbox from "@turf/bbox";
import React, { useEffect, useRef, useState } from "react";
import MapGL, { Layer, Source, WebMercatorViewport } from "react-map-gl";

import { NakshaMapboxViewProps } from "./interfaces";
import Navigation from "./navigation";
import { featureStyle, lineStyle, pointStyle } from "./static/constants";

/**
 * Renders Provided geojson.
 *
 * @export
 * @param {NakshaMapboxViewProps} {
 *   defaultViewPort,
 *   data,
 *   onFeaturesChange,
 *   baseLayer,
 *   mapboxApiAccessToken
 * }
 * @returns
 */
export function NakshaMapboxView({
  defaultViewPort,
  data,
  baseLayer,
  mapboxApiAccessToken,
}: NakshaMapboxViewProps) {
  const mapRef = useRef<any>(null);
  const [viewPort, setViewPort] = useState(defaultViewPort || dv);
  const [isLoaded, setIsLoaded] = useState<boolean>();

  const updateViewport = () => {
    if (!data || !isLoaded) {
      return;
    }

    const b = bbox(data);
    const { longitude, latitude, zoom } = new WebMercatorViewport(
      viewPort as any
    ).fitBounds([
      [b[0], b[1]],
      [b[2], b[3]],
    ]);

    const maxZoom = viewPort?.maxZoom || dv.maxZoom;

    setViewPort((o) => ({
      ...o,
      longitude,
      latitude,
      zoom: zoom > maxZoom ? maxZoom : zoom - 0.2,
    }));
  };

  const onLoad = () => {
    mapRef?.current?.getMap().once("idle", () => {
      updateWorldViewRef(mapRef);
      setIsLoaded(true);
    });

    mapRef?.current?.getMap().on("style.load", () => {
      updateWorldViewRef(mapRef);
    });
  };

  useEffect(() => {
    updateViewport();
  }, [data, isLoaded]);

  return (
    <MapGL
      {...viewPort}
      width="100%"
      height="100%"
      mapStyle={defaultMapStyles[baseLayer || BaseLayer.MAP_STREETS].style}
      onLoad={onLoad}
      ref={mapRef}
      onViewportChange={setViewPort}
      mapboxApiAccessToken={mapboxApiAccessToken}
    >
      <Navigation onViewportChange={setViewPort} />
      {data && (
        <Source type="geojson" data={data}>
          <Layer {...pointStyle} />
          <Layer {...lineStyle} />
          <Layer {...featureStyle} />
        </Source>
      )}
    </MapGL>
  );
}
