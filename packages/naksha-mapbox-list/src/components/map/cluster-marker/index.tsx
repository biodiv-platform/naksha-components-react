import React, { useEffect, useMemo, useState } from "react";
import { Marker } from "react-map-gl";
import useLayers from "../../../hooks/use-layers";
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

const ClusterMarker = ({ mapRef }) => {
  const { mp } = useLayers();

  const [data, setData] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [superCluster, setSuperCluster] = useState(null);
  const [bounds, setBounds] = useState([-180, -85, 180, 85]); // initial bounds

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
      // Check if both mapRef and superCluster are available
      updateClusters();
      mapRef.current.on("moveend", updateClusters); // Add event listener
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("moveend", updateClusters); // Clean up event listener
      }
    };
  }, [superCluster, mapRef.current]); // Add mapRef.current as a dependency

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
    <>
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
                height: `${mp.markerHeight}`,
                cursor: "pointer",
              }}
            />
          </Marker>
        );
      })}
    </>
  );
};

export default ClusterMarker;
