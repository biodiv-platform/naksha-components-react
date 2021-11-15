import {
  BaseLayer,
  defaultMapStyles,
  defaultViewPort as dv,
  updateWorldViewRef,
} from "@ibp/naksha-commons";
import { ViewMode } from "@nebula.gl/edit-modes";
import React, { useEffect, useRef, useState } from "react";
import MapGL from "react-map-gl";
import { DrawPolygonMode, Editor } from "react-map-gl-draw";

import { NakshaMapboxDrawProps } from "./interfaces";
import Navigation from "./navigation";
import { CURSOR_PENCIL } from "./static/constants";
import MapboxDrawToolbar from "./toolbar";

const featureStyle = {
  stroke: "#f03b20",
  fill: "#f03b20",
  strokeWidth: 2,
  strokeDasharray: "8,4",
  fillOpacity: 0.2,
};

/**
 * Allows you to select rectangular region in a map.
 * providing callback w/ raw features
 *
 * @export
 * @param {NakshaMapboxDrawProps} {
 *   defaultViewPort,
 *   defaultFeatures,
 *   onFeaturesChange,
 *   baseLayer,
 *   mapboxApiAccessToken
 * }
 * @returns
 */
function NakshaMapboxDraw({
  defaultViewPort,
  defaultFeatures,
  onFeaturesChange,
  baseLayer,
  mapboxApiAccessToken,
  isControlled,
  isReadOnly,
  isMultiple,
}: NakshaMapboxDrawProps) {
  const mapRef = useRef<any>(null);
  const [viewPort, setViewPort] = useState(defaultViewPort || dv);
  const [features, setFeatures] = useState(defaultFeatures || []);

  const [mode, setMode] = useState(
    isReadOnly ? new ViewMode() : new DrawPolygonMode()
  );

  useEffect(() => {
    if (onFeaturesChange) {
      if (features.length > 0) {
        onFeaturesChange(features);
      } else {
        onFeaturesChange([]);
      }
    }
  }, [features]);

  useEffect(() => {
    if (
      isControlled &&
      JSON.stringify(features) !== JSON.stringify(defaultFeatures)
    ) {
      setFeatures(defaultFeatures || []);
    }
  }, [defaultFeatures]);

  const onLoad = () => {
    mapRef?.current?.getMap().once("idle", () => {
      updateWorldViewRef(mapRef);
    });

    mapRef.current.getMap().on("style.load", () => {
      updateWorldViewRef(mapRef);
    });
  };

  const onUpdate = ({ editType, data }) => {
    if (editType === "addFeature") {
      setFeatures(isMultiple ? data : [data[data.length - 1]]);
    }
  };

  const clearFeatures = () => setFeatures([]);

  const getCursor: any = ({ isDragging }) =>
    isDragging ? "grabbing" : isReadOnly ? "grab" : CURSOR_PENCIL;

  return (
    <MapGL
      {...viewPort}
      width="100%"
      height="100%"
      mapStyle={defaultMapStyles[baseLayer || BaseLayer.MAP_STREETS].style}
      onLoad={onLoad}
      ref={mapRef}
      getCursor={getCursor}
      onViewportChange={setViewPort}
      mapboxApiAccessToken={mapboxApiAccessToken}
    >
      <Navigation onViewportChange={setViewPort} />
      {!isReadOnly && (
        <MapboxDrawToolbar clearFeatures={clearFeatures} setMode={setMode} />
      )}
      <Editor
        clickRadius={12}
        mode={mode}
        onUpdate={onUpdate}
        features={features}
        featureStyle={(e) =>
          e?.feature?.geometry?.type === "LineString"
            ? { ...featureStyle, fillOpacity: 0 }
            : featureStyle
        }
      />
    </MapGL>
  );
}

export { NakshaMapboxDraw, NakshaMapboxDrawProps };
