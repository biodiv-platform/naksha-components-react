import { GMAPS_LIBRARIES, mapboxToGmapsViewPort } from "@ibp/naksha-commons";
import { Data, GoogleMap, LoadScriptNext } from "@react-google-maps/api";
import React, { useEffect, useReducer, useRef, useState } from "react";

import NakshaAutocomplete from "./autocomplete";
import ClearFeatures from "./features/clear-features";
import { ACTION_TYPES, featuresReducer } from "./reducers/features";
import { GMAP_FEATURE_TYPES, GMAP_OPTIONS } from "./static/constants";
import {
  calculateBounds,
  geometryToGeoJsonFeature,
  toFullGeoJson,
} from "./utils/geojson";

export interface NakshaGmapsDrawProps {
  defaultViewPort?;
  defaultFeatures?;
  onFeaturesChange?;
  gmapApiAccessToken?;
  isControlled?: boolean;
  isReadOnly?: boolean;
  isMultiple?: boolean;
  isAutocomplete?: boolean;
  gmapRegion?;
  mapStyle?: React.CSSProperties;
  autocompleteComponent?;
}

export function NakshaGmapsDraw({
  defaultViewPort,
  defaultFeatures,
  onFeaturesChange,
  gmapApiAccessToken,
  isControlled,
  isReadOnly,
  isMultiple,
  isAutocomplete,
  gmapRegion,
  mapStyle,
  autocompleteComponent,
}: NakshaGmapsDrawProps) {
  const mapRef = useRef<any>(null);
  const [viewPort] = useState(mapboxToGmapsViewPort(defaultViewPort));
  const [features, dispatch] = useReducer(featuresReducer, defaultFeatures);
  const [isLoaded, setIsLoaded] = useState<boolean>();

  const reloadFeatures = () => {
    // Clear Map
    mapRef.current.state.map.data.forEach(function (feature) {
      mapRef.current.state.map.data.remove(feature);
    });

    // Recalculate GeoJson from features list
    const fullGeoJson = toFullGeoJson(features);

    if (fullGeoJson) {
      fullGeoJson && mapRef.current.state.map.data.addGeoJson(fullGeoJson);

      // Calculate bounds from GeoJson
      const bounds = calculateBounds(fullGeoJson);
      bounds && mapRef.current.state.map.fitBounds(bounds);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      onFeaturesChange && onFeaturesChange(features);

      reloadFeatures();
    }
  }, [isLoaded, features]);

  /**
   *  can simulate isControlled if `defaultFeatures` are going to be changed
   */
  useEffect(() => {
    if (
      isControlled &&
      JSON.stringify(features) !== JSON.stringify(defaultFeatures)
    ) {
      dispatch({
        action: ACTION_TYPES.REPLACE,
        data: defaultFeatures,
      });
    }
  }, [defaultFeatures]);

  const addFeature = (feature) => {
    dispatch({ action: ACTION_TYPES.ADD, data: feature, isMultiple });
  };

  const onFeatureAdded = (geometry) => {
    const feature = geometryToGeoJsonFeature(geometry);
    addFeature(feature);
  };

  const onClearFeatures = () => {
    dispatch({ action: ACTION_TYPES.CLEAR });
  };

  const onMapLoaded = () => setIsLoaded(true);

  return (
    <LoadScriptNext
      googleMapsApiKey={gmapApiAccessToken}
      region={gmapRegion}
      libraries={
        isAutocomplete ? GMAPS_LIBRARIES.AUTOCOMPLETE : GMAPS_LIBRARIES.DEFAULT
      }
    >
      <>
        {isAutocomplete && (
          <NakshaAutocomplete
            InputComponent={autocompleteComponent || <input />}
            addFeature={addFeature}
            gmapRegion={gmapRegion}
          />
        )}
        <GoogleMap
          id="naksha-gmaps-draw"
          mapContainerStyle={mapStyle || { height: "100%", width: "100%" }}
          zoom={viewPort.zoom}
          center={viewPort.center}
          options={GMAP_OPTIONS}
          ref={mapRef}
          onLoad={onMapLoaded}
        >
          {isMultiple && <ClearFeatures onClick={onClearFeatures} />}
          {!isReadOnly && (
            <Data
              options={{
                controls: [
                  GMAP_FEATURE_TYPES.POINT,
                  GMAP_FEATURE_TYPES.POLYGON,
                ],
                drawingMode: GMAP_FEATURE_TYPES.POLYGON,
                featureFactory: onFeatureAdded,
              }}
            />
          )}
        </GoogleMap>
      </>
    </LoadScriptNext>
  );
}
