import { GMAPS_LIBRARIES, mapboxToGmapsViewPort } from "@ibp/naksha-commons";
import { Data, GoogleMap, LoadScriptNext } from "@react-google-maps/api";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

import NakshaAutocomplete from "./autocomplete";
import ClearFeatures from "./features/clear-features";
import NakshaImport from "./import";
import { ACTION_TYPES, featuresReducer } from "./reducers/features";
import { GMAP_FEATURE_TYPES, GMAP_OPTIONS } from "./static/constants";
import TraceLocation from "./trace-location";
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
  isImport?: boolean;
  isMultiple?: boolean;
  isAutocomplete?: boolean;
  gmapRegion?;
  autoCompleteRegion?;
  mapStyle?: React.CSSProperties;
  importInputComponent?;
  importButtonComponent?;
  autocompleteComponent?;
  showTrace?;
  traceButtonComponent?;
  maxZoom?;
  options?;
}

const NakshaGmapsDraw = React.forwardRef(
  (
    {
      defaultViewPort,
      defaultFeatures,
      onFeaturesChange,
      gmapApiAccessToken,
      isControlled,
      isReadOnly,
      isMultiple,
      isImport,
      isAutocomplete,
      gmapRegion,
      autoCompleteRegion,
      mapStyle,
      importInputComponent,
      importButtonComponent,
      autocompleteComponent,
      showTrace,
      traceButtonComponent,
      maxZoom,
      options,
    }: NakshaGmapsDrawProps,
    ref: any
  ) => {
    const mapRef = useRef<any>(null);
    const [features, dispatch] = useReducer(featuresReducer, defaultFeatures);
    const [isLoaded, setIsLoaded] = useState<boolean>();

    const viewPort = useMemo(
      () => mapboxToGmapsViewPort(defaultViewPort),
      [defaultViewPort]
    );

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
        onFeaturesChange && onFeaturesChange(features);
        if (ref) {
          ref.current = { addFeature, replaceFeature };
        }
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

    const replaceFeature = (feature) => {
      dispatch({ action: ACTION_TYPES.REPLACE, data: [feature] });
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
          isAutocomplete
            ? GMAPS_LIBRARIES.AUTOCOMPLETE
            : GMAPS_LIBRARIES.DEFAULT
        }
      >
        <>
          <div className="map-toolbar" style={{ display: "flex" }}>
            {isAutocomplete && (
              <NakshaAutocomplete
                InputComponent={autocompleteComponent || <input />}
                addFeature={addFeature}
                gmapRegion={autoCompleteRegion ?? gmapRegion}
              />
            )}
            {isImport && (
              <NakshaImport
                InputComponent={importInputComponent || <input />}
                ButtonComponent={
                  importButtonComponent || <button children="import" />
                }
                addFeature={addFeature}
              />
            )}
          </div>
          {showTrace && (
            <TraceLocation
              TraceButtonComponent={
                traceButtonComponent || <button children="trace" />
              }
              onFeatureAdded={onFeatureAdded}
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
                options={
                  {
                    controls: [
                      GMAP_FEATURE_TYPES.POINT,
                      GMAP_FEATURE_TYPES.POLYGON,
                      GMAP_FEATURE_TYPES.LINESTRING,
                    ],
                    drawingMode: GMAP_FEATURE_TYPES.POLYGON,
                    featureFactory: onFeatureAdded,
                    ...(options || {}),
                  } as any
                }
              />
            )}
          </GoogleMap>
        </>
      </LoadScriptNext>
    );
  }
);

export { NakshaGmapsDraw };
