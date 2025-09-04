import { useEffect, useState, useCallback, useMemo } from "react";
import {
  SelectIcon,
  PointIcon,
  LineIcon,
  PolygonIcon,
  PencilOpenIcon,
  PencilCloseIcon,
  DeleteIcon,
  LocateIcon,
  RectangleIcon,
  CircleIcon,
  FreeHandIcon,
} from "../icon-buttons/icons";
import { GeoJSONStoreFeatures, TerraDraw } from "terra-draw";
import MapButton from "../map-button/map-button";

type MapButtonsProps = {
  mode: string;
  setMode: (mode: string) => void;
  onClick: (mode: string) => void;
  draw: TerraDraw;
  onFeaturesChange?: (features: GeoJSONStoreFeatures[]) => void;
  isMultiple?: boolean;
  autoFocus?: (features: GeoJSONStoreFeatures[]) => void;
};

function MapButtons({
  mode,
  setMode,
  onClick,
  draw,
  onFeaturesChange,
  isMultiple = true,
  autoFocus,
}: MapButtonsProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasFeatures, setHasFeatures] = useState(false);

  const updateHasFeatures = useCallback(
    () => setHasFeatures(draw.getSnapshot().length > 0),
    [draw]
  );

  useEffect(() => {
    if (!draw) return;
    draw.on("finish", updateHasFeatures);
    draw.on("change", updateHasFeatures);
    updateHasFeatures();
    return () => {
      draw.off("finish", updateHasFeatures);
      draw.off("change", updateHasFeatures);
    };
  }, [draw, updateHasFeatures]);

  const handleGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        const pt: GeoJSONStoreFeatures = {
          type: "Feature",
          geometry: { type: "Point", coordinates: coords },
          properties: { mode: "point", source: "geolocation" },
        };
        if (!isMultiple) draw.clear();
        draw.addFeatures([pt]);
        onFeaturesChange?.(draw.getSnapshot());
        autoFocus?.([pt]);
      },
      (error) => {
        alert("Error getting geolocation");
        console.error(error);
      }
    );
    setMode("current-location");
  }, [draw, isMultiple, onFeaturesChange, autoFocus]);

  const handleClear = useCallback(() => {
    draw.clear();
    setHasFeatures(false);
    setMode("static");
    onFeaturesChange?.([]);
  }, [draw, onFeaturesChange]);

  const buttons = useMemo(
    () => [
      {
        icon: <LocateIcon />,
        mode: "current-location",
        onClick: handleGeolocation,
        tooltip: "Use current location",
      },
      {
        icon: <SelectIcon />,
        mode: "select",
        onClick,
        tooltip: "Select",
      },
      {
        icon: <PointIcon />,
        mode: "point",
        onClick,
        tooltip: "Point",
      },
      {
        icon: <LineIcon />,
        mode: "linestring",
        onClick,
        tooltip: "Linestring",
      },
      {
        icon: <PolygonIcon />,
        mode: "polygon",
        onClick,
        tooltip: "Polygon",
      },
      {
        icon: <RectangleIcon />,
        mode: "rectangle",
        onClick,
        tooltip: "Reactangle",
      },
      {
        icon: <CircleIcon />,
        mode: "circle",
        onClick,
        tooltip: "Circle",
      },
      {
        icon: <FreeHandIcon />,
        mode: "freehand",
        onClick,
        tooltip: "Freehand",
      },
      {
        icon: <DeleteIcon />,
        mode: "clear",
        onClick: handleClear,
        tooltip: "Clear all features",
        disabled: !hasFeatures,
      },
    ],
    [onClick, handleGeolocation, handleClear, hasFeatures]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 1000,
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: 8,
        borderRadius: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: 30,
          height: 30,
          padding: 0,
          borderRadius: 4,
          backgroundColor: "#d3d3d3",
        }}
        title="Expand or collapse tools"
      >
        {expanded ? <PencilCloseIcon /> : <PencilOpenIcon />}
      </button>
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {buttons.map((btn, i) => (
            <MapButton
              key={i}
              icon={btn.icon}
              mode={btn.mode}
              currentMode={mode}
              onClick={btn.onClick}
              tooltip={btn.tooltip}
              disabled={btn.disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MapButtons;
