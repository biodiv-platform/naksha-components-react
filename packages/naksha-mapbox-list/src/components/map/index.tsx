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

export default function Map() {
  const mapRef = useRef(null);
  const { mp, layer, hover, query } = useLayers();
  const [data, setData] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [superCluster, setSuperCluster] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [hoveredClusterId, setHoveredClusterId] = useState(null);
  const [markerData, setMarkerData] = useState({});

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
      {layer.selectedFeatures?.length > 0 && <InfoBar />}
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
                      width: `${
                        20 +
                        (properties.point_count / data.features.length) * 20
                      }px`,
                      height: `${
                        20 +
                        (properties.point_count / data.features.length) * 20
                      }px`,
                      backgroundColor: "rgba(0, 0, 255, 0.5)",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      cursor: "pointer",
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
                    // zIndex: hoveredMarkerId === properties.id ? 1000 : 1,
                  }}
                  onMouseEnter={() =>
                    handleMouseEnterOnMarker(properties.id, false)
                  }
                  onMouseLeave={handleMouseLeaveOnMarker}
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

                  {hoveredMarkerId === properties.id &&
                    markerData[properties.id] && (
                      <div
                        className="location-marker-hover"
                        style={{
                          position: "absolute",
                          top: 30,
                          left: 10,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <DataCard data={markerData[properties.id]} />
                      </div>
                    )}
                </div>
              </Marker>
            );
          })}

        {/* Layers logic */}
        {layer.selectedLayers.map((_l, index) => {
          const beforeId = index > 0 ? layer.selectedIds[index - 1] : undefined;
          return <MapLayer key={_l.id} layer={_l} beforeId={beforeId} />;
        })}

        <HoverPopup key="popup" coordinates={coordinates} />
      </MapGL>
    </div>
  );
}
