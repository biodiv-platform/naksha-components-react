import React, { useMemo, useState, useRef } from "react";
import MapGL, { NavigationControl, MapRef } from "react-map-gl";
import useLayers from "../../hooks/use-layers";
import { MapLayer } from "./layers";
import MarkersList from "./markers-list";
import { tw } from "twind";
import InfoBar from "../infobar";
import Sidebar from "../sidebar";
import HoverPopup from "./popup";
import { HoveredMarker } from "../../interfaces";
import Cluster from "./cluster";
import { CLUSTER_LAYERS } from "../../static/constants";

export default function Map() {
  const mapRef = useRef<MapRef | null>(null);

  const {
    mp,
    layer,
    hover,
    query,
    markerDetails,
    setMarkerDetails,
    showLayerHoverPopup,
  } = useLayers();

  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(
    null
  );
  const [hoveredMarkerData, setHoveredMarkerData] = useState<
    Record<string, any>
  >({});

  const viewState = useMemo(
    () =>
      mp.defaultViewState || {
        longitude: -103.5917,
        latitude: 40.6699,
        zoom: 3,
      },
    [mp.defaultViewState]
  );

  const handleMapClick = async (event: any) => {
    const { features, lngLat } = event;

    query.setClickedLngLat(lngLat);

    if (features && features.length) {
      const feature = features[0];
      if (feature.layer.id === CLUSTER_LAYERS.CLUSTERS) {
        const clusterId = feature.properties.cluster_id;
        const mapboxSource = mapRef.current?.getSource("points") as any;

        if (mapboxSource?.getClusterExpansionZoom) {
          mapboxSource.getClusterExpansionZoom(
            clusterId,
            (err: Error, zoom: number) => {
              if (!err) {
                mapRef.current?.easeTo({
                  center: lngLat,
                  zoom,
                  duration: 500,
                });
              }
            }
          );
        }
        setMarkerDetails([]);
      } else if (feature.layer.id === CLUSTER_LAYERS.UNCLUSTERED_POINTS) {
        try {
          const data = await mp.hoverFunction(feature.properties.id);
          setMarkerDetails(data);
        } catch (error) {
          console.error("Error fetching marker details:", error);
          setMarkerDetails([]);
        }
      } else {
        setMarkerDetails([]);
      }
    } else {
      setMarkerDetails([]);
    }
  };

  const handleMapMouseMove = async (event: any) => {
    const { features, lngLat } = event;
    setCoordinates(lngLat);
    hover.onHover(event);

    const canvas = mapRef.current?.getCanvas() as HTMLCanvasElement;
    if (features && features.length) {
      const feature = features[0];
      if (feature.layer.id === CLUSTER_LAYERS.UNCLUSTERED_POINTS) {
        canvas.style.cursor = "pointer";
        setHoveredMarker({
          lngLat: feature.geometry.coordinates as [number, number],
          properties: feature.properties,
        });
        const data = await mp.hoverFunction(feature.properties.id);
        setHoveredMarkerData((prevData) => ({
          ...prevData,
          [feature.properties.id]: data,
        }));
      } else if (feature.layer.id === CLUSTER_LAYERS.CLUSTERS) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
        setHoveredMarker(null);
      }
    } else {
      canvas.style.cursor = "default";
      setHoveredMarker(null);
    }
  };

  return (
    <div className={tw`h-full w-full relative bg-gray-100`}>
      {mp.loadToC && <Sidebar />}
      {(markerDetails?.id || layer?.selectedFeatures?.length > 0) && (
        <InfoBar />
      )}
      <MapGL
        id="mapl"
        cursor="default"
        initialViewState={viewState}
        minZoom={3}
        mapboxAccessToken={mp.mapboxAccessToken}
        style={{ width: "100%", height: "100%" }}
        mapStyle={layer.mapStyle}
        onClick={handleMapClick}
        onMouseMove={handleMapMouseMove}
        interactiveLayerIds={[
          CLUSTER_LAYERS.CLUSTERS,
          CLUSTER_LAYERS.UNCLUSTERED_POINTS,
        ]}
        ref={mapRef}
      >
        <NavigationControl
          position={"bottom-right"}
          showZoom={true}
          showCompass={true}
        />
        <MarkersList />
        <Cluster
          mapRef={mapRef}
          hoveredMarker={hoveredMarker}
          hoveredMarkerData={hoveredMarkerData}
        />
        {layer.selectedLayers.map((_l, index) => {
          const beforeId =
            index > 0 ? layer.selectedLayers[index - 1].id : undefined;
          return <MapLayer key={_l.id} layer={_l} beforeId={beforeId} />;
        })}
        {showLayerHoverPopup && <HoverPopup coordinates={coordinates} />}
      </MapGL>
    </div>
  );
}
