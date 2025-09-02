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

// Helper function to calculate bounds from features
const getFeaturesBounds = (
  features: GeoJSONStoreFeatures[]
): maplibregl.LngLatBounds | null => {
  if (!features.length) return null;

  const bounds = new maplibregl.LngLatBounds();

  features.forEach((feature) => {
    const coordinates = getCoordinatesFromFeature(feature);
    coordinates.forEach((coord) => {
      if (Array.isArray(coord[0])) {
        coord.forEach((c) => bounds.extend(c as maplibregl.LngLatLike));
      } else {
        bounds.extend(coord as maplibregl.LngLatLike);
      }
    });
  });

  return bounds;
};

const getCoordinatesFromFeature = (feature: GeoJSONStoreFeatures): any[] => {
  const geometry = feature.geometry;
  switch (geometry.type) {
    case "Point":
      return [geometry.coordinates];
    case "LineString":
      return [geometry.coordinates];
    case "Polygon":
      return geometry.coordinates;
    default:
      return [];
  }
};

interface TerraDrawControlProps {
  features?: GeoJSONStoreFeatures[];
  setFeatures?: (features: GeoJSONStoreFeatures[]) => void;
  isControlled?: boolean;
  isMultiple?: boolean;
}

const Map = (props: NakshaMaplibreViewProps & TerraDrawControlProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map>();
  const [mode, setMode] = useState("static");
  const [selected, setSelected] = useState<GeoJSONStoreFeatures>();
  const [features, setFeatures] = useState<GeoJSONStoreFeatures[]>([]);
  const [draw, setDraw] = useState<TerraDraw>();

  const mapStyle = defaultMapStyles[props?.mapStyle || 0].style;
  const {
    isMultiple = true,
    isControlled = false,
    setFeatures: setExternalFeatures,
  } = props;

  // Internal state for uncontrolled mode
  const [internalFeatures, setInternalFeatures] = useState<
    GeoJSONStoreFeatures[]
  >([]);

  const handleFeaturesChange = useCallback(
    (newFeatures: GeoJSONStoreFeatures[]) => {
      if (isControlled && setExternalFeatures) {
        setExternalFeatures(newFeatures);
      } else {
        setInternalFeatures(newFeatures);
      }
    },
    [isControlled, setExternalFeatures]
  );

  const currentFeatures = isControlled
    ? props.features || []
    : internalFeatures;

  const zoomToFeaturesBounds = useCallback(
    (featuresToZoom: GeoJSONStoreFeatures[]) => {
      if (!map || featuresToZoom.length === 0) return;

      const bounds = getFeaturesBounds(featuresToZoom);
      if (bounds && !bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 50,
          duration: 1000,
          maxZoom: 5,
        });
      }
    },
    [map]
  );

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

  useEffect(() => {
    if (!map) return;

    const terraDraw = setupDraw(map);
    terraDraw.start();
    setDraw(terraDraw);

    const onChange = () => {
      const snapshot = terraDraw.getSnapshot();

      // Apply isMultiple logic
      let filteredFeatures = snapshot;
      if (!isMultiple && snapshot.length > 1) {
        // Keep only the most recent feature and remove others
        const latestFeature = snapshot[snapshot.length - 1];
        filteredFeatures = [latestFeature];

        // Remove older features from TerraDraw
        const featuresToRemove = snapshot.slice(0, -1);
        const featureIds = featuresToRemove
          .map((f) => f.id)
          .filter((id): id is string => id !== undefined);

        if (featureIds.length > 0) {
          terraDraw.removeFeatures(featureIds);
        }
      }

      setFeatures(filteredFeatures);
      handleFeaturesChange(filteredFeatures);
      setSelected(filteredFeatures.find((f) => f.properties.selected));

      // Automatically zoom to features
      if (filteredFeatures.length > 0) {
        zoomToFeaturesBounds(filteredFeatures);
      }
    };

    terraDraw.on("change", onChange);

    // Load initial features
    if (props.features?.length) {
      setTimeout(() => {
        if (terraDraw.getSnapshot().length === 0) {
          const featuresWithMode = ensureModeProperty(props.features);

          // Apply isMultiple to initial features too
          let initialFeatures = featuresWithMode;
          if (!isMultiple && featuresWithMode.length > 1) {
            initialFeatures = [featuresWithMode[featuresWithMode.length - 1]];
          }

          terraDraw.addFeatures(initialFeatures);
          setFeatures(initialFeatures);
          handleFeaturesChange(initialFeatures);
          zoomToFeaturesBounds(initialFeatures);
        }
      }, 300);
    }

    return () => {
      terraDraw.off("change", onChange);
      terraDraw.stop();
    };
  }, [map, isMultiple, handleFeaturesChange, zoomToFeaturesBounds]);

  const changeMode = useCallback(
    (newMode: string) => {
      draw?.setMode(newMode);
      setMode(newMode);
    },
    [draw]
  );

  return (
    <div>
      <div
        ref={mapRef}
        id="maplibre-map"
        style={{ width: "100%", height: "100vh" }}
      />

      {draw && (
        <>
          <MapButtons mode={mode} changeMode={changeMode} draw={draw} />
          {/* <ClearButton draw={draw} /> */}
        </>
      )}
    </div>
  );
};

export default Map;
