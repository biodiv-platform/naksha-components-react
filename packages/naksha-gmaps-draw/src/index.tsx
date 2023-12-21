import {
  GMAPS_LIBRARIES,
  mapboxToGmapsViewState,
} from "@biodiv-platform/naksha-commons";
import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { Data, GoogleMap, LoadScriptNext } from "@react-google-maps/api";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

import NakshaAutocomplete from "./autocomplete";
import ClearFeatures from "./features/clear-features";
import GeojsonImport from "./geojson";
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
    const modalContentRef = useRef<any>(null);
    const [features, dispatch] = useReducer(featuresReducer, data);
    const [isLoaded, setIsLoaded] = useState<boolean>();
    const { isOpen, onOpen, onClose } = useDisclosure(); // Initialize useDisclosure
    const [modalHeight, setModalHeight] = useState("auto");

    const viewPort = useMemo(
      () => mapboxToGmapsViewState(defaultViewState),
      [defaultViewState]
    );

    const reloadFeatures = () => {
      // Clear Map
      mapRef.current.state.map.data.forEach(function (feature) {
        mapRef.current.state.map.data.remove(feature);
      });

      const fullGeoJson = toFullGeoJson(features);

      if (fullGeoJson) {
        fullGeoJson && mapRef.current.state.map.data.addGeoJson(fullGeoJson);

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

    const openModal = () => {
      onOpen();
    };

    const closeModal = () => {
      onClose();
    };

    useEffect(() => {
      if (isOpen) {
        // Update modal height when it is open using useRef
        const contentHeight = modalContentRef.current?.offsetHeight;
        setModalHeight(contentHeight ? `${contentHeight}px` : "auto");
      }
    }, [isOpen]);

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
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingBottom: "15px",
              }}
            >
              <Button
                onClick={openModal}
                style={{
                  padding: "8px 25px",
                  backgroundColor: "#519895",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Import
              </Button>
            </div>
          </div>
          <Modal
            blockScrollOnMount={false}
            isOpen={isOpen}
            onClose={closeModal}
            isCentered
            size="auto"
          >
            <ModalOverlay />
            <ModalContent
              ref={modalContentRef} // Set ref for modal content
              style={{
                maxWidth: "550px",
                height: modalHeight, // Set height to "auto" initially
                margin: "auto",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                backgroundColor: "#fff",
                display: "flex", // Use flex to control the layout
                flexDirection: "column", // Arrange children in a column
                padding: "30px 30px 30px 30px",
                backdropFilter: "blur(5px)",
                marginTop: "90px",
              }}
            >
              <ModalHeader
                style={{
                  position: "relative",
                  zIndex: 2,// Set a higher zIndex for the ModalHeader
                  padding: "10px 0", // Add padding at the top
                }}
              >
                <CloseIcon
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-17px",
                    cursor: "pointer",
                    zIndex: 3,
                  }}
                  onClick={closeModal}
                />
              </ModalHeader>
              <ModalBody style={{ display: "flex", flexDirection: "column" }}>
                <Table variant="striped" colorScheme="teal">
                  <Tbody>
                    <Tr>
                      <Td>
                        <Box
                          borderWidth="1px"
                          borderRadius="lg"
                          p="4"
                          mb="20"
                          pb="20"
                          pt="10"
                        >
                          <NakshaImport
                            InputComponent={importInputComponent || <input />}
                            ButtonComponent={
                              importButtonComponent || (
                                <Button>Import Coordinates</Button>
                              )
                            }
                            addFeature={addFeature}
                          />
                        </Box>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Box
                          borderWidth="1px"
                          borderRadius="lg"
                          p="4"
                          mb="4" // Increased margin-bottom
                          pb="20"
                        >
                          <GeojsonImport
                            addFeature={addFeature}
                            ButtonComponent={
                              importButtonComponent || <Button>Add</Button>
                            }
                          />
                        </Box>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </ModalBody>
            </ModalContent>
          </Modal>
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

export { GMAP_FEATURE_TYPES, NakshaGmapsDraw };