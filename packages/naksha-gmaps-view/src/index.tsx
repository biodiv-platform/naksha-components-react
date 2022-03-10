import { GMAPS_LIBRARIES, mapboxToGmapsViewState } from "@ibp/naksha-commons";
import { GoogleMap, LoadScriptNext } from "@react-google-maps/api";
import React, { useEffect, useRef, useState } from "react";

import { GMAP_OPTIONS } from "./static/constants";
import { calculateBounds } from "./utils/geojson";

export interface NakshaGmapsViewProps {
  defaultViewPort?;
  features?;
  gmapApiAccessToken?;
  gmapRegion?;
  mapStyle?: React.CSSProperties;
  maxZoom?;
  options?;
}

export function NakshaGmapsView({
  defaultViewPort,
  gmapApiAccessToken,
  gmapRegion,
  features,
  mapStyle,
  maxZoom,
  options,
}: NakshaGmapsViewProps) {
  const mapRef = useRef<any>(null);
  const [viewPort] = useState(mapboxToGmapsViewState(defaultViewPort));
  const [isLoaded, setIsLoaded] = useState<boolean>();

  const reloadFeatures = () => {
    // Clear Map
    mapRef.current.state.map.data.forEach(function (feature) {
      mapRef.current.state.map.data.remove(feature);
    });

    const fullGeoJson = Array.isArray(features)
      ? { type: "FeatureCollection", features: features }
      : features;

    if (fullGeoJson) {
      fullGeoJson && mapRef.current.state.map.data.addGeoJson(fullGeoJson);

      // Calculate bounds from GeoJson
      const bounds = calculateBounds(fullGeoJson);

      bounds && mapRef.current.state.map.fitBounds(bounds);

      if (maxZoom) {
        google.maps.event.addListenerOnce(
          mapRef.current.state.map,
          "idle",
          function () {
            const z = mapRef.current.state.map.getZoom();
            mapRef.current.state.map.setZoom(Math.min(maxZoom, z));
          }
        );
      }
    }
  };

  useEffect(() => {
    if (isLoaded) {
      reloadFeatures();
    }
  }, [isLoaded, features]);

  const onMapLoaded = () => setIsLoaded(true);

  return (
    <LoadScriptNext
      googleMapsApiKey={gmapApiAccessToken}
      region={gmapRegion}
      libraries={GMAPS_LIBRARIES.DEFAULT}
    >
      <GoogleMap
        id="naksha-gmaps-view"
        mapContainerStyle={mapStyle || { height: "100%", width: "100%" }}
        zoom={viewPort.zoom}
        center={viewPort.center}
        options={{ ...GMAP_OPTIONS, ...(options || {}) }}
        ref={mapRef}
        onLoad={onMapLoaded}
      />
    </LoadScriptNext>
  );
}
