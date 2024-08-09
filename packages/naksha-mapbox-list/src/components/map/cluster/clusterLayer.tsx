import React, { useEffect, useState, useMemo } from "react";
import { Source, Layer, Marker, useMap } from "react-map-gl";
import useLayers from "../../../hooks/use-layers";
import { CLUSTER_LAYERS } from "../../../static/constants";

const ClusterLayer = ({ mapRef }) => {
  const { current: map } = useMap();
  const { mp, markerDetails, layer } = useLayers();
  const [selectedMarkerCoordinates, setSelectedMarkerCoordinates] = useState<
    [number, number] | null
  >(null);

  const selectedLayerIds = useMemo(
    () => layer.selectedLayers.map((l) => l.id),
    [layer.selectedLayers]
  );

  useEffect(() => {
    if (mapRef.current) {
      const moveClusterLayersToTop = () => {
        mapRef.current?.moveLayer(CLUSTER_LAYERS.CLUSTERS);
        mapRef.current?.moveLayer(CLUSTER_LAYERS.CLUSTER_COUNT);
        mapRef.current?.moveLayer(CLUSTER_LAYERS.UNCLUSTERED_POINTS);
      };

      mapRef.current.on("render", moveClusterLayersToTop);

      return () => {
        mapRef.current?.off("render", moveClusterLayersToTop);
      };
    }
  }, [selectedLayerIds]);

  // Filter data to remove selected marker or cluster
  const geoJson = useMemo(() => {
    if (!markerDetails?.id) return mp.clusterMarkers;

    return {
      ...mp.clusterMarkers,
      features: mp?.clusterMarkers?.features.filter((f) => {
        const { id, cluster, cluster_id } = f.properties;
        return (
          id !== markerDetails?.id &&
          (!cluster || cluster_id !== markerDetails?.id)
        );
      }),
    };
  }, [mp.clusterMarkers, markerDetails?.id]);

  // Load the custom marker icon once
  useEffect(() => {
    if (map && !map.hasImage("location")) {
      map.loadImage(
        `https://a.tiles.mapbox.com/v4/marker/pin-m+FF0000.png?access_token=${mp.mapboxAccessToken}`,
        (error, image) => {
          if (error || !image) return;
          map.addImage("location", image);
        }
      );
    }
  }, [map, mp.mapboxAccessToken]);

  // Update selected marker coordinates
  useEffect(() => {
    if (!markerDetails?.id) {
      setSelectedMarkerCoordinates(null);
      return;
    }

    const feature = mp?.clusterMarkers?.features?.find(
      (f) => f.properties.id === markerDetails?.id
    );
    if (feature) {
      setSelectedMarkerCoordinates(
        feature.geometry.coordinates as [number, number]
      );
    }
  }, [markerDetails?.id, mp?.clusterMarkers?.features]);

  return (
    <>
      <Source
        id="points"
        type="geojson"
        data={geoJson}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer
          id={CLUSTER_LAYERS.CLUSTERS}
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#008cff",
              50,
              "#ffbf00",
              100,
              "#ff0000",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
          }}
        />
        <Layer
          id={CLUSTER_LAYERS.CLUSTER_COUNT}
          type="symbol"
          layout={{
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          }}
        />
        <Layer
          id={CLUSTER_LAYERS.UNCLUSTERED_POINTS}
          type="symbol"
          filter={["!", ["has", "point_count"]]}
          layout={{
            "icon-image": "location",
            "icon-size": 0.8,
            "icon-allow-overlap": true,
          }}
        />
      </Source>
      {selectedMarkerCoordinates && (
        <Marker
          longitude={selectedMarkerCoordinates[0]}
          latitude={selectedMarkerCoordinates[1]}
          style={{ cursor: "pointer" }}
        >
          <div className="bounce-animation">
            <img
              src={`https://a.tiles.mapbox.com/v4/marker/pin-m+FF0000.png?access_token=${mp.mapboxAccessToken}`}
              alt="Selected Marker"
            />
          </div>
        </Marker>
      )}
    </>
  );
};

export default ClusterLayer;
