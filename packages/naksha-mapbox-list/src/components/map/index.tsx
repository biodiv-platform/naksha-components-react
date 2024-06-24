import { defaultViewState } from "@biodiv-platform/naksha-commons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Marker, NavigationControl } from "react-map-gl";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import InfoBar from "../infobar";
import Sidebar from "../sidebar";
import { MapLayer } from "./layers";
import MarkersList from "./markers-list";
import ClusterMarker from "./cluster-marker";
import HoverPopup from "./popup";

const NavControl: any = NavigationControl;

import supercluster from "supercluster";

const convertToGeoJSON = (data) => {
  return {
    type: "FeatureCollection",
    features: data.map((point) => ({
      type: "Feature",
      properties: { id: point.id },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
    })),
  };
};

export default function Map() {
  const mapRef = useRef(null);
  const { mp, layer, hover, query } = useLayers();

  const [coordinates, setCoordinates] = useState<any>();
  const viewState = useMemo(
    () => mp.defaultViewState || defaultViewState,
    [mp.defaultViewState]
  );

  const onMapClick = (e) => query.setClickedLngLat(e.lngLat);

  const handleOnMouseMove = (event) => {
    setCoordinates(event.lngLat);
    hover.onHover(event);
  };

  const handleMapLoad = () => {
    updateClusters();
    mapRef.current.on("moveend", updateClusters);
  };

  const [data, setData] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [superCluster, setSuperCluster] = useState(null);
  const [bounds, setBounds] = useState([-180, -85, 180, 85]);

  // Load points data and initialize supercluster
  useEffect(() => {
    if (mp.clusterMarkers) {
      const geojson = convertToGeoJSON(mp.clusterMarkers);
      setData(geojson);

      const superclusterInstance = new supercluster({
        radius: 50,
        maxZoom: 16,
      });
      superclusterInstance.load(geojson.features);
      setSuperCluster(superclusterInstance);
    }
  }, [mp.clusterMarkers]);

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
      setBounds(mapBounds);
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
        {clusters.map((cluster) => {
          const { geometry, properties } = cluster;
          const [longitude, latitude] = geometry.coordinates;

          if (properties.cluster) {
            return (
              <Marker
                key={`cluster-${properties.cluster_id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  style={{
                    width: `${
                      20 + (properties.point_count / data.features.length) * 20
                    }px`,
                    height: `${
                      20 + (properties.point_count / data.features.length) * 20
                    }px`,
                    backgroundColor: "rgba(0, 0, 255, 0.5)",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const expansionZoom = superCluster.getClusterExpansionZoom(
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
            >
              <img
                src={`https://a.tiles.mapbox.com/v4/marker/pin-m+red.png?access_token=${mp.mapboxAccessToken}`}
                alt="Marker"
                onClick={() =>
                  global.window.open(
                    `https://communityconservedareas.org/data/show/${properties.id}`, //TODO: Fix this
                    "_blank"
                  )
                }
                style={{
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                }}
              />
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
