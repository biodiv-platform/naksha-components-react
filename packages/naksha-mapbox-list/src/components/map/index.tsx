import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import MapGL, { NavigationControl, MapRef } from "react-map-gl";
import useLayers from "../../hooks/use-layers";
import { MapLayer } from "./layers";
import MarkersList from "./markers-list";
import { tw } from "twind";
import InfoBar from "../infobar";
import Sidebar from "../sidebar";
import DataCard from "./data-card";
import HoverPopup from "./popup";
import ClusterLayer from "./cluster";

interface FeatureProperties {
  id: string;
  [key: string]: any;
}

interface GeoJSONFeature {
  type: "Feature";
  properties: { id: string };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface GeoJSON {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

interface HoveredMarker {
  lngLat: [number, number];
  properties: FeatureProperties;
}

const Map: React.FC = () => {
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
  const [markerData, setMarkerData] = useState<Record<string, any>>({});

  const clusterMarkers: any[] = useMemo(
    () => mp.clusterMarkers || [],
    [mp.clusterMarkers]
  );

  const convertToGeoJSON = useCallback(
    (data: any[]): GeoJSON => ({
      type: "FeatureCollection",
      features: data.map((point) => ({
        type: "Feature",
        properties: { id: point.id },
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
      })),
    }),
    []
  );

  const geojson: GeoJSON = useMemo(
    () => convertToGeoJSON(clusterMarkers),
    [clusterMarkers, convertToGeoJSON]
  );

  const viewState = useMemo(
    () =>
      mp.defaultViewState || {
        longitude: -103.5917,
        latitude: 40.6699,
        zoom: 3,
      },
    [mp.defaultViewState]
  );

  const handleMapClick = useCallback(
    async (event: any) => {
      const { features, lngLat } = event;

      query.setClickedLngLat(event.lngLat);

      if (features && features.length) {
        const feature = features[0];
        if (feature.layer.id === "clusters") {
          const clusterId = feature.properties.cluster_id;
          const mapboxSource = mapRef.current?.getSource("points") as any;

          if (
            mapboxSource &&
            typeof mapboxSource.getClusterExpansionZoom === "function"
          ) {
            mapboxSource.getClusterExpansionZoom(
              clusterId,
              (err: Error, zoom: number) => {
                if (err) return;
                mapRef.current?.easeTo({
                  center: lngLat,
                  zoom,
                  duration: 500,
                });
              }
            );
          }
        } else if (feature.layer.id === "unclustered-point") {
          const data = await mp.hoverFunction(feature.properties.id);
          setMarkerDetails(data);
        } else {
          setMarkerDetails([]);
        }
      } else {
        setMarkerDetails([]);
      }
    },
    [query, mp, setMarkerDetails]
  );

  const handleMapMouseMove = useCallback(
    async (event: any) => {
      const { features, lngLat } = event;
      setCoordinates(lngLat);
      hover.onHover(event);

      if (features && features.length) {
        const feature = features[0];
        if (feature.layer.id === "unclustered-point") {
          setHoveredMarker({
            lngLat: feature.geometry.coordinates as [number, number],
            properties: feature.properties,
          });
          const data = await mp.hoverFunction(feature.properties.id);
          setMarkerData((prevData) => ({
            ...prevData,
            [feature.properties.id]: data,
          }));
        } else {
          setHoveredMarker(null);
        }
      } else {
        setHoveredMarker(null);
      }
    },
    [hover, mp]
  );

  const selectedLayerIds: string[] = useMemo(
    () => layer.selectedLayers.map((l) => l.id),
    [layer.selectedLayers]
  );

  useEffect(() => {
    if (mapRef.current) {
      const moveClusterLayersToTop = () => {
        mapRef.current?.moveLayer("clusters");
        mapRef.current?.moveLayer("cluster-count");
        mapRef.current?.moveLayer("unclustered-point");
      };

      mapRef.current.on("render", moveClusterLayersToTop);

      return () => {
        mapRef.current?.off("render", moveClusterLayersToTop);
      };
    }
  }, [selectedLayerIds]);

  return (
    <div className={tw`h-full w-full relative bg-gray-100`}>
      {mp.loadToC && <Sidebar />}
      {(markerDetails.id || layer?.selectedFeatures?.length > 0) && <InfoBar />}
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
        interactiveLayerIds={["clusters", "unclustered-point"]}
        ref={mapRef}
      >
        <NavigationControl
          position="bottom-right"
          showZoom={true}
          showCompass={true}
        />
        <MarkersList />

        <ClusterLayer data={geojson} />

        {layer.selectedLayers.map((_l, index) => {
          const beforeId =
            index > 0 ? layer.selectedLayers[index - 1].id : undefined;
          return <MapLayer key={_l.id} layer={_l} beforeId={beforeId} />;
        })}

        {hoveredMarker?.properties?.id &&
        markerData[hoveredMarker?.properties?.id] ? (
          <DataCard
            coordinates={hoveredMarker?.lngLat}
            data={markerData[hoveredMarker.properties.id]}
          />
        ) : (
          showLayerHoverPopup && (
            <HoverPopup key="popup" coordinates={coordinates} />
          )
        )}
      </MapGL>
    </div>
  );
};

export default Map;
