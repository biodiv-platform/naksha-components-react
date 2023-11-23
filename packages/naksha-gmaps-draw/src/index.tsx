import {
  GMAPS_LIBRARIES,
  mapboxToGmapsViewState,
} from "@biodiv-platform/naksha-commons";
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
import GeojsonImport from "./geojson";
import Modal from "react-modal";

export interface NakshaGmapsDrawProps {
  defaultViewState?;
  defaultDrawingMode?;
  data?;
  onDataChange?;
  gmapAccessToken?;
  isControlled?: boolean;
  isReadOnly?: boolean;
  isImport?: boolean;
  geojsonImport?: boolean;
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
      defaultViewState,
      defaultDrawingMode,
      data,
      onDataChange,
      gmapAccessToken,
      isControlled,
      isReadOnly,
      isMultiple,
      isImport,
      geojsonImport,
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
    const [features, dispatch] = useReducer(featuresReducer, data);
    const [isLoaded, setIsLoaded] = useState<boolean>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const modalStyles = {
      content: {
        maxWidth: "400px",
        maxHeight: "300px", // Adjust the maximum height as needed
        margin: "auto",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
      },
    };

    const openModal = () => {
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

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
          <div className="map-toolbar" style={{ display: "flex" }}>
            {isAutocomplete && (
              <NakshaAutocomplete
                InputComponent={autocompleteComponent || <input />}
                addFeature={addFeature}
                gmapRegion={autoCompleteRegion ?? gmapRegion}
              />
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" , paddingBottom: "15px"}}>
              <button
                onClick={openModal}
                style={{
                  padding: "8px 25px", // Adjusted padding
                  backgroundColor: "#519895", 
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Import
              </button>
            </div>
            {/* Single Modal containing both NakshaImport and GeojsonImport */}
            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Import Modal"
              style={modalStyles}
            >
              <div style={{ marginBottom: "10px" }}>
                <NakshaImport
                  InputComponent={importInputComponent || <input />}
                  ButtonComponent={
                    importButtonComponent || <button>Import Coordinates</button>
                  }
                  addFeature={addFeature}
                />
              </div>
              <div>
                <GeojsonImport
                  // InputComponent={geojsonInputComponent || <input />}
                  // ButtonComponent={
                  //   geojsonButtonComponent || <button>Import Geojson</button>
                  // }
                  addFeature={addFeature}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={closeModal}
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </Modal>
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