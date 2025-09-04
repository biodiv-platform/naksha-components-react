import maplibregl from "maplibre-gl";
import { useRef, useState, useEffect, useCallback } from "react";
import { GeoJSONStoreFeatures } from "terra-draw/dist/store/store";
import { ensureModeProperty, setupDraw } from "./setup-draw";
import { TerraDraw } from "terra-draw";
import { setupMaplibreMap } from "./setup-maplibre";
import { NakshaMaplibreViewProps } from "../interfaces";
import MapButtons from "./map-buttons/map-buttons";
import { defaultMapStyles } from "@biodiv-platform/naksha-commons";
import bbox from "@turf/bbox";

const Map = (props: NakshaMaplibreViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map>();
  const [mode, setMode] = useState("static");
  const [draw, setDraw] = useState<TerraDraw>();
  const mapStyle = defaultMapStyles[props?.mapStyle || 0].style;
  const { isMultiple = true, features = [], onFeaturesChange } = props;

  // Autofocus utility
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
    const fullscreen = new maplibregl.FullscreenControl({});
    maplibreMap.addControl(navControl, "bottom-right");
    maplibreMap.addControl(fullscreen, "bottom-right");

    maplibreMap.once("style.load", () => setMap(maplibreMap));
    return () => {
      maplibreMap.removeControl(navControl);
    };
  }, [mapStyle, props.defaultViewState]);

  useEffect(() => {
    if (!map) return;
    const terraDraw = setupDraw(map);
    terraDraw.start();
    setDraw(terraDraw);

    const handleChange = () => {
      let snapshot = terraDraw.getSnapshot();
      let filtered = snapshot;
      if (!isMultiple && snapshot.length > 1) {
        filtered = [snapshot[snapshot.length - 1]];
        const toRemove = snapshot
          .slice(0, -1)
          .map((f) => f.id)
          .filter(Boolean);
        if (toRemove.length > 0) terraDraw.removeFeatures(toRemove as string[]);
      }
      onFeaturesChange?.(snapshot);
      autoFocus(filtered);
    };
    terraDraw.on("finish", handleChange);

    // Add initial features
    if (features.length) {
      setTimeout(() => {
        if (terraDraw.getSnapshot().length === 0) {
          let withMode = ensureModeProperty(features);
          let initial =
            !isMultiple && withMode.length > 1 ? [withMode.at(-1)!] : withMode;
          terraDraw.addFeatures(initial);
          autoFocus(initial);
        }
      });
    }

    return () => {
      terraDraw.off("finish", handleChange);
      terraDraw.stop();
    };
  }, [map, isMultiple, autoFocus, features, onFeaturesChange]);

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
