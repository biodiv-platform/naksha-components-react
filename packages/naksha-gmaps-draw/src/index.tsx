import {
  GMAPS_LIBRARIES,
  mapboxToGmapsViewState,
} from "@biodiv-platform/naksha-commons";
import { Data, GoogleMap, LoadScriptNext } from "@react-google-maps/api";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

import NakshaAutocomplete from "./autocomplete";
import ClearFeatures from "./features/clear-features";
import { ACTION_TYPES, featuresReducer } from "./reducers/features";
import { GMAP_FEATURE_TYPES, GMAP_OPTIONS } from "./static/constants";
import TraceLocation from "./trace-location";
import {
  calculateBounds,
  geometryToGeoJsonFeature,
  toFullGeoJson,
} from "./utils/geojson";
import ModalImport from "./ModalImport";

export interface NakshaGmapsDrawProps {
  defaultViewState?;
  defaultDrawingMode?;
  data?;
  onDataChange?;
  gmapAccessToken?;
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
  importModalComponent?;
  isOpen?;
  onClose?;
  importButtonComponentModal?;
  importDeleteIcon?;
  importLocationIcon?;
  importFileIcon?;
  importSuccessIcon?;
  importFailureIcon?;
}

const NakshaGmapsDraw = React.forwardRef(
  (
    {
      defaultViewState,
      defaultDrawingMode,
      data,
      onDataChange,
      gmapAccessToken,
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
      importModalComponent,
      isOpen,
      onClose,
      importButtonComponentModal,
      importDeleteIcon,
      importLocationIcon,
      importFileIcon,
      importSuccessIcon,
      importFailureIcon,
    }: NakshaGmapsDrawProps,
    ref: any
  ) => {
    const mapRef = useRef<any>(null);
    const [features, dispatch] = useReducer(featuresReducer, data);
    const [isLoaded, setIsLoaded] = useState<boolean>();

    const viewPort = useMemo(
      () => mapboxToGmapsViewState(defaultViewState),
      [defaultViewState]
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
        onDataChange && onDataChange(features);
        if (ref) {
          ref.current = { addFeature, replaceFeature };
        }
        reloadFeatures();
      }
    }, [isLoaded, features]);

    /**
     *  can simulate isControlled if `data` are going to be changed
     */
    useEffect(() => {
      if (isControlled && JSON.stringify(features) !== JSON.stringify(data)) {
        dispatch({
          action: ACTION_TYPES.REPLACE,
          data: data,
        });
      }
    }, [data]);

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
        googleMapsApiKey={gmapAccessToken}
        region={gmapRegion}
        libraries={
          isAutocomplete
            ? GMAPS_LIBRARIES.AUTOCOMPLETE
            : GMAPS_LIBRARIES.DEFAULT
        }
      >
        <>
          <div style={{ display: "flex" }}>
            {isAutocomplete && (
              <div style={{ width: "500px" }}>
                <NakshaAutocomplete
                  InputComponent={autocompleteComponent || <input />}
                  addFeature={addFeature}
                  gmapRegion={autoCompleteRegion ?? gmapRegion}
                />
              </div>
            )}

            <div style={{ flex: "1" }}></div>
            <ModalImport
              ButtonComponent={
                importButtonComponent || <button children="add" />
              }
              ModalComponent={
                importModalComponent &&
                React.cloneElement(importModalComponent, { isOpen, onClose })
              }
              InputComponent={importInputComponent || <input />}
              addFeature={addFeature}
              ButtonComponentModal={
                importButtonComponentModal || <button children="add" />
              }
              DeleteIcon={importDeleteIcon}
              LocationIcon={importLocationIcon}
              FileIcon={importFileIcon}
              SuccessIcon={importSuccessIcon}
              FailureIcon={importFailureIcon}
            />
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
                    drawingMode:
                      defaultDrawingMode || GMAP_FEATURE_TYPES.POLYGON,
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

export { NakshaGmapsDraw, GMAP_FEATURE_TYPES };