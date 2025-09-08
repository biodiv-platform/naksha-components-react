import maplibregl from "maplibre-gl";
import { useRef, useState, useEffect, useCallback } from "react";
import { GeoJSONStoreFeatures } from "terra-draw/dist/store/store";
import { ensureModeProperty, MapStyleSwitcher, setupDraw } from "./setup-draw";
import { TerraDraw } from "terra-draw";
import { setupMaplibreMap } from "./setup-maplibre";
import { NakshaMaplibreViewProps } from "../interfaces";
import MapButtons from "./map-buttons/map-buttons";
import bbox from "@turf/bbox";
import { defaultMapStyles } from "@biodiv-platform/naksha-commons";

const Map = (props: NakshaMaplibreViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map>();
  const [mode, setMode] = useState("static");
  const [draw, setDraw] = useState<TerraDraw>();
  const drawRef = useRef<TerraDraw>();
  const { isMultiple, features = [], onFeaturesChange } = props;

  const [selectedMapStyleIdx, setSelectedMapStyleIdx] = useState(
    props?.mapStyle || 0
  );
  const mapTile = props.mapStyles ?? defaultMapStyles;
  const mapStyle = mapTile[selectedMapStyleIdx]?.style;
  const mapStyleConfig = mapTile[selectedMapStyleIdx];

  const storedFeaturesRef = useRef<GeoJSONStoreFeatures[]>([]);

  const autoFocus = useCallback(
    (features: GeoJSONStoreFeatures[]) => {
      if (!features?.length || !map) return;
      const _bbox = bbox({ type: "FeatureCollection", features });
      map.fitBounds(_bbox as any, {
        padding: 40,
        duration: 1000,
        maxZoom: 15,
      });
    },
    [map]
  );

  useEffect(() => {
    if (features.length > 0) {
      storedFeaturesRef.current = ensureModeProperty(features);
    }

    const maplibreMap = setupMaplibreMap({
      containerId: "maplibre-map",
      latitude: props.defaultViewState?.latitude ?? 0,
      longitude: props.defaultViewState?.longitude ?? 0,
      zoom: props.defaultViewState?.zoom ?? 0,
      pitch: props.defaultViewState?.pitch ?? 0,
      bearing: props.defaultViewState?.bearing ?? 0,
      mapstyle: mapStyle,
    });

    if ("maxZoom" in mapStyleConfig && mapStyleConfig.maxZoom) {
      maplibreMap.setMaxZoom(mapStyleConfig.maxZoom);
    }

    const navControl = new maplibregl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    });
    const fullscreen = new maplibregl.FullscreenControl({});
    maplibreMap.addControl(navControl, "bottom-right");
    maplibreMap.addControl(fullscreen, "bottom-right");

    maplibreMap.once("style.load", () => {
      setMap(maplibreMap);
    });

    return () => {
      if (drawRef.current) {
        storedFeaturesRef.current = drawRef.current.getSnapshot();
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
      if (maplibreMap) {
        maplibreMap.removeControl(navControl);
        maplibreMap.removeControl(fullscreen);
        maplibreMap.remove();
      }
    };
  }, [mapStyle]);

  const filterUserFeatures = (features: GeoJSONStoreFeatures[]) =>
    features.filter(
      (f) =>
        f.geometry.type !== "Point" ||
        (f.properties.mode !== "static" && f.properties.mode !== "select")
    );

  useEffect(() => {
    if (!map) return;
    const terraDraw = setupDraw(map);
    terraDraw.start();
    drawRef.current = terraDraw;
    setDraw(terraDraw);

    const handleChange = () => {
      let snapshot = terraDraw.getSnapshot();
      let userFeatures = filterUserFeatures(snapshot);

      if (!isMultiple && userFeatures.length > 1) {
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
      onFeaturesChange?.(userFeatures);
      autoFocus(userFeatures);
    };
    terraDraw.on("finish", handleChange);

    setTimeout(() => {
      if (terraDraw.getSnapshot().length === 0) {
        let featuresToAdd: GeoJSONStoreFeatures[] = [];
        if (storedFeaturesRef.current.length > 0) {
          featuresToAdd = storedFeaturesRef.current;
        } else if (features.length > 0) {
          featuresToAdd = ensureModeProperty(features);
        }
        if (!isMultiple && featuresToAdd.length > 1) {
          featuresToAdd = [featuresToAdd.at(-1)!];
        }
        if (featuresToAdd.length > 0) {
          terraDraw.addFeatures(featuresToAdd);
          autoFocus(featuresToAdd);
        }
      }
    }, 100);

    return () => {
      terraDraw.off("finish", handleChange);
    };
  }, [map]);

  const changeMode = useCallback(
    (newMode: string) => {
      draw?.setMode(newMode);
      setMode(newMode);
    },
    [draw]
  );

  const handleStyleChange = (idx: number) => {
    if (drawRef.current) {
      storedFeaturesRef.current = drawRef.current.getSnapshot();
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
