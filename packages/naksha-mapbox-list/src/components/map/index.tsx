import { defaultViewState } from "@biodiv-platform/naksha-commons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Marker, NavigationControl } from "react-map-gl";
import { tw } from "twind";
import useLayers from "../../hooks/use-layers";
import InfoBar from "../infobar";
import Sidebar from "../sidebar";
import DataCard from "./cluster-marker/dataCard";
import { MapLayer } from "./layers";
import MarkersList from "./markers-list";
import HoverPopup from "./popup";
import supercluster from "supercluster";
import TestDataCard from "./cluster-marker-popup";

const NavControl = NavigationControl;

const convertToGeoJSON = (data) => {
  return {
    type: "FeatureCollection",
    features: data.map((point) => ({
      type: "Feature",
      properties: { id: point.id },
      geometry: {
        type: "Point",
        coordinates: [point.lng, point.lat],
      },
    })),
  };
};

// Function to get color based on cluster size
const getClusterColor = (count) => {
  if (count > 100) return "#ff0000";
  if (count > 50) return "#ffbf00";
  if (count > 25) return "#ffbf00";
  return "#008cff";
};

// Function to get size based on cluster size
const getClusterSize = (count) => {
  if (count > 100) return 60;
  if (count > 50) return 50;
  if (count > 25) return 40;
  return 30;
};

export default function Map() {
  const mapRef = useRef(null);
  const { mp, layer, hover, query, setMarkerDetails } = useLayers();
  const [data, setData] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [superCluster, setSuperCluster] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [hoveredClusterId, setHoveredClusterId] = useState(null);
  const [markerData, setMarkerData] = useState({});
  const [selectedMarker, setSelectedMarker] = useState(false);

  const findCoordinatesById = (id) => {
    const feature = data?.features?.find((item) => item.properties.id === id);
    if (feature) {
      const [longitude, latitude] = feature.geometry.coordinates;
      return { lat: latitude, lng: longitude };
    }
    return null;
  };

  const handleMouseEnterOnMarker = async (id, isCluster) => {
    setHoveredClusterId(null);
    if (isCluster) {
      setHoveredClusterId(id);
    } else {
      setHoveredMarkerId(id);
    }

    if (!markerData[id] && !isCluster) {
      try {
        // Replace this with your actual API call
        const data = await mp.hoverFunction(id);
        setMarkerData((prevData) => ({
          ...prevData,
          [id]: data,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const handleMouseLeaveOnMarker = () => {
    setHoveredMarkerId(null);
    setHoveredClusterId(null);
  };

  const handleClickOnMarker = async (id) => {
    setSelectedMarker(true);
    if (markerData[id]) {
      setMarkerDetails(markerData[id]);
    } else {
      const data = await mp.hoverFunction(id);
      setMarkerDetails(data);
    }
  };

  const [coordinates, setCoordinates] = useState(null);
  const viewState = useMemo(
    () => mp.defaultViewState || defaultViewState,
    [mp.defaultViewState]
  );
  const clusterMarkers = useMemo(() => mp.clusterMarkers, [mp.clusterMarkers]);

  const onMapClick = (e) => query.setClickedLngLat(e.lngLat);

  const handleOnMouseMove = (event) => {
    setCoordinates(event.lngLat);
    hover.onHover(event);
  };

  const handleMapLoad = () => {
    updateClusters();
    mapRef.current.on("moveend", updateClusters);
  };

  // Load points data and initialize supercluster
  useEffect(() => {
    if (clusterMarkers) {
      const geojson = convertToGeoJSON(clusterMarkers);
      setData(geojson);

      const superclusterInstance = new supercluster({
        radius: 50,
        maxZoom: 16,
      });
      superclusterInstance.load(geojson.features);
      setSuperCluster(superclusterInstance);
    }
  }, [clusterMarkers]);

  useEffect(() => {
    if (mapRef.current && superCluster) {
      updateClusters();
      mapRef.current.on("moveend", updateClusters); // Add event listener
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("moveend", updateClusters); // Clean up event listener
      }
    };
  }, [superCluster, mapRef.current]);

  const updateClusters = () => {
    if (superCluster && mapRef.current) {
      const zoom = Math.floor(mapRef.current.getZoom());
      const mapBounds = mapRef.current.getBounds().toArray().flat();
      const clusters = superCluster.getClusters(mapBounds, zoom);
      setClusters(clusters);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      updateClusters();
    }
  }, [mapRef]);

  return (
    <div className={tw`h-full w-full relative bg-gray-100`}>
      {mp.loadToC && <Sidebar />}
      {(selectedMarker || layer?.selectedFeatures?.length > 0) && <InfoBar />}
      <MapGL
        id="mapl"
        cursor="default"
        initialViewState={viewState}
        mapboxAccessToken={mp.mapboxAccessToken}
        style={{ width: "100%", height: "100%" }}
        mapStyle={layer.mapStyle}
        onClick={onMapClick}
        onLoad={handleMapLoad}
        onMouseMove={handleOnMouseMove}
        ref={mapRef}
      >
        <NavControl
          position="bottom-right"
          showZoom={true}
          showCompass={true}
        />
        <MarkersList />

        {/* Cluster logic */}
        {clusters &&
          clusters.map((cluster) => {
            const { geometry, properties } = cluster;
            const [longitude, latitude] = geometry.coordinates;

            if (properties.cluster) {
              const size = getClusterSize(properties.point_count);
              const color = getClusterColor(properties.point_count);

              return (
                <Marker
                  key={`cluster-${properties.cluster_id}`}
                  latitude={latitude}
                  longitude={longitude}
                  className="cluster-marker-wrapper"
                >
                  <div
                    className="cluster-marker"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: color,
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    onMouseEnter={() =>
                      handleMouseEnterOnMarker(properties.cluster_id, true)
                    }
                    onMouseLeave={handleMouseLeaveOnMarker}
                    onClick={() => {
                      const expansionZoom =
                        superCluster.getClusterExpansionZoom(
                          properties.cluster_id
                        );
                      mapRef.current.easeTo({
                        center: geometry.coordinates,
                        zoom: expansionZoom,
                        duration: 500,
                      });
                    }}
                  >
                    {properties.point_count_abbreviated}
                  </div>
                </Marker>
              );
            }

            return (
              <Marker
                key={`point-${properties.id}`}
                latitude={latitude}
                longitude={longitude}
                className="location-marker-wrapper"
              >
                <div
                  className="location-marker"
                  style={{
                    position: "relative",
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() =>
                    handleMouseEnterOnMarker(properties.id, false)
                  }
                  onMouseLeave={handleMouseLeaveOnMarker}
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent event from bubbling up
                    handleClickOnMarker(properties.id);
                  }}
                >
                  <svg width="24px" height="35px" viewBox="38 12 128 180">
                    <path
                      style={{
                        fill: "red",
                        stroke: "#fafafa",
                        strokeWidth: 2,
                        strokeMiterlimit: 10,
                      }}
                      d="M158.5,73.8c0-32.3-26.2-58.4-58.4-58.4c-32.3,0-58.4,26.2-58.4,58.4c0,16.6,6.9,31.5,18,42.1
      c7.2,7.2,16.7,17.2,20.1,22.5c7,10.9,20,47.9,20,47.9s13.3-37,20.4-47.9c3.3-5.1,12.2-14.4,19.3-21.6
      C151.2,106.1,158.5,90.9,158.5,73.8z"
                    />
                    <circle
                      style={{ fill: "#fafafa", opacity: 0.8 }}
                      cx="100.1"
                      cy="74.7"
                      r="20"
                    />
                  </svg>
                </div>
              </Marker>
            );
          })}

        {/* Layers logic */}
        {layer.selectedLayers.map((_l, index) => {
          const beforeId = index > 0 ? layer.selectedIds[index - 1] : undefined;
          return <MapLayer key={_l.id} layer={_l} beforeId={beforeId} />;
        })}

        {hoveredMarkerId && markerData[hoveredMarkerId] ? (
          <TestDataCard
            coordinates={findCoordinatesById(hoveredMarkerId)}
            data={markerData[hoveredMarkerId]}
          />
        ) : (
          <HoverPopup key="popup" coordinates={coordinates} />
        )}
      </MapGL>
    </div>
  );
}
