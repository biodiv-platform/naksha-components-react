import maplibregl from "maplibre-gl";
import { GeoJSONStoreFeatures } from "terra-draw/dist/store/store";
import { setupDraw } from "./setup-draw";
import { TerraDraw } from "terra-draw";
import { useRef, useState, useEffect, useCallback } from "react";
import { setupMaplibreMap } from "./setup-maplibre";
import { NakshaMaplibreViewProps } from "../interfaces";
import MapButtons from "./map-buttons/MapButtons";
import ClearButton from "./icon-buttons/ClearButton";
import { defaultMapStyles } from "@biodiv-platform/naksha-commons";
import bbox from "@turf/bbox";

const ensureModeProperty = (features: any[]): GeoJSONStoreFeatures[] => {
  return features.map((feature) => {
    if (feature.properties?.mode) return feature;

    const geometryType = feature.geometry?.type;
    const mode =
      geometryType === "Point"
        ? "point"
        : geometryType === "Polygon"
        ? "polygon"
        : geometryType === "LineString"
        ? "linestring"
        : "unknown";

    return {
      ...feature,
      properties: { ...feature.properties, mode },
    };
  }) as GeoJSONStoreFeatures[];
};

const Map = (props: NakshaMaplibreViewProps) => {
  console.log("Map props:", props);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map>();
  const [mode, setMode] = useState("static");
  const [draw, setDraw] = useState<TerraDraw>();

  const mapStyle = defaultMapStyles[props?.mapStyle || 0].style;
  const { isMultiple = true } = props; // 👈 added

  useEffect(() => {
    const maplibreMap = setupMaplibreMap({
      containerId: "maplibre-map",
      latitude: props.defaultViewState?.latitude ?? 0,
      longitude: props.defaultViewState?.longitude ?? 0,
      zoom: props.defaultViewState?.zoom ?? 0,
      pitch: props.defaultViewState?.pitch ?? 0,
      bearing: props.defaultViewState?.bearing ?? 0,
      mapstyle: mapStyle,
    });

    const navControl = new maplibregl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    });
    maplibreMap.addControl(navControl, "bottom-right");

    maplibreMap.once("style.load", () => setMap(maplibreMap));

    return () => {
      if (navControl && maplibreMap) {
        maplibreMap.removeControl(navControl);
      }
    };
  }, []);

  const autoFocus = useCallback(
    (features: GeoJSONStoreFeatures[]) => {
      if (!features?.length || !map) return;

      const _bbox = bbox({
        type: "FeatureCollection",
        features: features as any,
      });

      map.fitBounds(_bbox as any, { padding: 40, duration: 1000 });
    },
    [map]
  );

  useEffect(() => {
    if (!map) return;

    const terraDraw = setupDraw(map);
    terraDraw.start();
    setDraw(terraDraw);

    const handleChange = () => {
      const snapshot = terraDraw.getSnapshot();

      let filteredFeatures = snapshot;
      if (!isMultiple && snapshot.length > 1) {
        const latestFeature = snapshot[snapshot.length - 1];
        filteredFeatures = [latestFeature];

        const featuresToRemove = snapshot.slice(0, -1);
        const featureIds = featuresToRemove
          .map((f) => f.id)
          .filter((id): id is string => id !== undefined);

        if (featureIds.length > 0) {
          terraDraw.removeFeatures(featureIds);
        }
      }
      autoFocus(filteredFeatures); // 👈 added here
    };

    terraDraw.on("finish", handleChange);

    if (props.features?.length) {
      setTimeout(() => {
        if (terraDraw.getSnapshot().length === 0) {
          const featuresWithMode = ensureModeProperty(props.features);

          let initialFeatures = featuresWithMode;
          if (!isMultiple && featuresWithMode.length > 1) {
            initialFeatures = [featuresWithMode[featuresWithMode.length - 1]];
          }

          terraDraw.addFeatures(initialFeatures);
          autoFocus(initialFeatures); // 👈 added here
        }
      });
    }

    return () => {
      terraDraw.off("finish", handleChange);
      terraDraw.stop();
    };
  }, [map, isMultiple, autoFocus]);

  const changeMode = useCallback(
    (newMode: string) => {
      draw?.setMode(newMode);
      setMode(newMode);
    },
    [draw]
  );

  return (
    <div
      ref={mapRef}
      id="maplibre-map"
      style={{ width: "100%", height: "100%" }}
    >
      {draw && (
        <>
          <MapButtons mode={mode} changeMode={changeMode} />
          <div
            style={{
              position: "absolute",
              top: "180px",
              left: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              zIndex: 1000,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "8px",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            <ClearButton draw={draw} />
          </div>
        </>
      )}
    </div>
  );
};

export default Map;
