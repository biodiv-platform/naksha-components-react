import type {
  FullscreenControl as IFullscreenControl,
  Map as MaplibreMap,
  NavigationControl as INavigationControl,
} from "maplibre-gl";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  ensureModeProperty,
  filterUserFeatures,
  MapStyleSwitcher,
  setupDraw,
} from "./setup-draw";
import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";
import { setupMaplibreMap } from "./setup-maplibre";
import { NakshaMaplibreViewProps } from "../interfaces";
import MapButtons from "./map-buttons/map-buttons";
import bbox from "@turf/bbox";
import { defaultMapStyles } from "@biodiv-platform/naksha-commons";

const Map = (props: NakshaMaplibreViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MaplibreMap>();
  const [mode, setMode] = useState("static");
  const [draw, setDraw] = useState<TerraDraw>();
  const drawRef = useRef<TerraDraw | undefined>(undefined);
  const { isMultiple, features = [], onFeaturesChange } = props;

  const [selectedMapStyleIdx, setSelectedMapStyleIdx] = useState(
    props?.mapStyle || 0
  );
  const mapTile = props.mapStyles ?? defaultMapStyles;
  const mapStyle = mapTile[selectedMapStyleIdx]?.style;
  const mapStyleConfig = mapTile[selectedMapStyleIdx];

  const storedFeaturesRef = useRef<GeoJSONStoreFeatures[]>([]);
  const isMultipleRef = useRef(isMultiple);
  isMultipleRef.current = isMultiple;

  const onFeaturesChangeRef = useRef(onFeaturesChange);
  onFeaturesChangeRef.current = onFeaturesChange;

  const prevFeaturesRef = useRef<string>("");

  const autoFocus = useCallback(
    (features: GeoJSONStoreFeatures[]) => {
      if (!features?.length || !map) return;
      try {
        const _bbox = bbox({ type: "FeatureCollection", features });
        if (_bbox.every(Number.isFinite)) {
          if (_bbox[0] === _bbox[2] && _bbox[1] === _bbox[3]) {
            map.easeTo({
              center: [_bbox[0], _bbox[1]],
              zoom: Math.max(map.getZoom(), 12),
              duration: 1000,
            });
          } else {
            map.fitBounds(_bbox as any, {
              padding: 40,
              duration: 1000,
              maxZoom: 15,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to autoFocus", e);
      }
    },
    [map]
  );

  useEffect(() => {
    let isCancelled = false;
    let activeMap: MaplibreMap | undefined;
    let activeNavControl: INavigationControl | undefined;
    let activeFullscreen: IFullscreenControl | undefined;

    if (features.length > 0) {
      storedFeaturesRef.current = ensureModeProperty(features);
    }

    (async () => {
      const { NavigationControl, FullscreenControl } =
        await import("maplibre-gl");

      const maplibreMap = await setupMaplibreMap({
        container: mapRef.current || "maplibre-map",
        containerId: "maplibre-map",
        latitude: props.defaultViewState?.latitude ?? 0,
        longitude: props.defaultViewState?.longitude ?? 0,
        zoom: props.defaultViewState?.zoom ?? 0,
        pitch: props.defaultViewState?.pitch ?? 0,
        bearing: props.defaultViewState?.bearing ?? 0,
        mapstyle: mapStyle,
        workerUrl: props.workerUrl,
      });

      if (isCancelled) {
        maplibreMap.remove();
        return;
      }

      activeMap = maplibreMap;

      if ("maxZoom" in mapStyleConfig && mapStyleConfig.maxZoom) {
        maplibreMap.setMaxZoom(mapStyleConfig.maxZoom);
      }

      const navControl = new NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      });
      const fullscreen = new FullscreenControl({});
      activeNavControl = navControl;
      activeFullscreen = fullscreen;

      maplibreMap.addControl(navControl, "bottom-right");
      maplibreMap.addControl(fullscreen, "bottom-right");

      maplibreMap.once("style.load", () => {
        if (!isCancelled) {
          setMap(maplibreMap);
        }
      });
    })();

    return () => {
      isCancelled = true;
      if (drawRef.current) {
        storedFeaturesRef.current = filterUserFeatures(
          drawRef.current.getSnapshot()
        );
      }
      if (drawRef.current) {
        try {
          drawRef.current.stop();
        } catch {
          // ignore stop errors
        }
        drawRef.current = undefined;
        setDraw(undefined);
      }
      if (activeMap) {
        if (activeNavControl) activeMap.removeControl(activeNavControl);
        if (activeFullscreen) activeMap.removeControl(activeFullscreen);
        activeMap.remove();
      }
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!map) return;
    const terraDraw = setupDraw(map);
    terraDraw.start();
    drawRef.current = terraDraw;
    setDraw(terraDraw);

    const handleFinish = () => {
      let snapshot = terraDraw.getSnapshot();
      let userFeatures = filterUserFeatures(snapshot);

      if (!isMultipleRef.current && userFeatures.length > 1) {
        const lastFeature = userFeatures.at(-1)!;
        const toRemove = userFeatures
          .slice(0, -1)
          .map((f) => f.id)
          .filter((id): id is string => Boolean(id));

        if (toRemove.length > 0) {
          try {
            terraDraw.removeFeatures(toRemove);
          } catch {}
        }
        userFeatures = [lastFeature];
      }
      onFeaturesChangeRef.current?.(userFeatures);
      autoFocus(userFeatures);
    };

    const handleStoreChange = (_ids: (string | number)[], type: string) => {
      const currentMode = terraDraw.getMode();
      // Only process changes when not actively drawing (e.g. in select or static mode)
      if (currentMode !== "select" && currentMode !== "static") {
        return;
      }
      if (type === "delete" || type === "update") {
        let snapshot = terraDraw.getSnapshot();
        let userFeatures = filterUserFeatures(snapshot);
        onFeaturesChangeRef.current?.(userFeatures);
      }
    };

    terraDraw.on("finish", handleFinish);
    terraDraw.on("change", handleStoreChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const currentModeName = terraDraw.getMode();
        if (currentModeName === "polygon" || currentModeName === "linestring") {
          const activeMode = (terraDraw as any)?._modes?.[currentModeName];
          if (
            activeMode &&
            typeof activeMode.close === "function" &&
            activeMode.currentId
          ) {
            e.preventDefault();
            activeMode.close();
          }
        }
      }
    };

    const handleDblClick = (e: MouseEvent) => {
      const currentModeName = terraDraw.getMode();
      if (currentModeName === "polygon" || currentModeName === "linestring") {
        const activeMode = (terraDraw as any)?._modes?.[currentModeName];
        if (
          activeMode &&
          typeof activeMode.close === "function" &&
          activeMode.currentId
        ) {
          e.preventDefault();
          e.stopPropagation();
          activeMode.close();
        }
      }
    };

    const canvas = map.getCanvas();
    if (canvas) {
      canvas.addEventListener("dblclick", handleDblClick);
    }
    window.addEventListener("keydown", handleKeyDown);

    const timer = setTimeout(() => {
      if (terraDraw.getSnapshot().length === 0) {
        let featuresToAdd: GeoJSONStoreFeatures[] = [];
        if (storedFeaturesRef.current.length > 0) {
          featuresToAdd = storedFeaturesRef.current;
        } else if (features.length > 0) {
          featuresToAdd = ensureModeProperty(features);
        }
        if (!isMultipleRef.current && featuresToAdd.length > 1) {
          featuresToAdd = [featuresToAdd.at(-1)!];
        }
        if (featuresToAdd.length > 0) {
          terraDraw.addFeatures(featuresToAdd);
          autoFocus(featuresToAdd);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (canvas) {
        canvas.removeEventListener("dblclick", handleDblClick);
      }
      window.removeEventListener("keydown", handleKeyDown);
      terraDraw.off("finish", handleFinish);
      terraDraw.off("change", handleStoreChange);
    };
  }, [map]);

  useEffect(() => {
    if (!drawRef.current || !props.isControlled) return;
    const featuresStr = JSON.stringify(features);
    if (featuresStr !== prevFeaturesRef.current) {
      prevFeaturesRef.current = featuresStr;
      drawRef.current.clear();
      if (features.length > 0) {
        let featuresToAdd = ensureModeProperty(features);
        if (!isMultipleRef.current && featuresToAdd.length > 1) {
          featuresToAdd = [featuresToAdd.at(-1)!];
        }
        if (featuresToAdd.length > 0) {
          drawRef.current.addFeatures(featuresToAdd);
          autoFocus(featuresToAdd);
        }
      }
    }
  }, [features, props.isControlled, autoFocus]);

  const changeMode = useCallback(
    (newMode: string) => {
      draw?.setMode(newMode);
      setMode(newMode);
    },
    [draw]
  );

  const handleStyleChange = (idx: number) => {
    if (drawRef.current) {
      storedFeaturesRef.current = filterUserFeatures(
        drawRef.current.getSnapshot()
      );
    }
    setSelectedMapStyleIdx(idx);
    setMode("static");
  };

  return (
    <div
      ref={mapRef}
      id="maplibre-map"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <MapStyleSwitcher
        currentStyleIdx={selectedMapStyleIdx}
        onStyleChange={handleStyleChange}
        mapStyles={mapTile}
      />
      {draw && (
        <MapButtons
          mode={mode}
          setMode={setMode}
          onClick={changeMode}
          draw={draw}
          onFeaturesChange={onFeaturesChange}
          isMultiple={isMultiple}
          autoFocus={autoFocus}
        />
      )}
    </div>
  );
};

export default Map;
