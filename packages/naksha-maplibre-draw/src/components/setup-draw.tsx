import {
  TerraDraw,
  TerraDrawSelectMode,
  TerraDrawPointMode,
  TerraDrawLineStringMode,
  TerraDrawPolygonMode,
  TerraDrawCircleMode,
  TerraDrawFreehandMode,
  ValidateNotSelfIntersecting,
  TerraDrawRectangleMode,
  GeoJSONStoreFeatures,
} from "terra-draw";

import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

import maplibregl from "maplibre-gl";
import { tw } from "twind";
import React from "react";

export function setupDraw(map: maplibregl.Map) {
  return new TerraDraw({
    tracked: true,
    adapter: new TerraDrawMapLibreGLAdapter({
      map,
      coordinatePrecision: 9,
    }),
    modes: [
      new TerraDrawSelectMode({
        flags: {
          polygon: {
            feature: {
              scaleable: true,
              rotateable: true,
              draggable: true,
              coordinates: {
                midpoints: true,
                draggable: true,
                deletable: true,
              },
            },
          },
          linestring: {
            feature: {
              draggable: true,
              coordinates: {
                midpoints: true,
                draggable: true,
                deletable: true,
              },
            },
          },
          circle: {
            feature: {
              draggable: true,
            },
          },
          point: {
            feature: {
              draggable: true,
            },
          },
          rectangle: {
            feature: {
              draggable: true,
              coordinates: {
                resizable: "opposite",
              },
            },
          },
          freehand: {
            feature: {
              draggable: true,
            },
          },
        },
      }),
      new TerraDrawPointMode(),
      new TerraDrawLineStringMode({
        validation: (feature, { updateType }) => {
          if (updateType === "finish" || updateType === "commit") {
            return ValidateNotSelfIntersecting(feature);
          }
          return {
            valid: true,
          };
        },
      }),
      new TerraDrawRectangleMode(),
      new TerraDrawPolygonMode({
        pointerDistance: 30,
        validation: (feature, { updateType }) => {
          if (updateType === "finish" || updateType === "commit") {
            return ValidateNotSelfIntersecting(feature);
          }
          return {
            valid: true,
          };
        },
      }),
      new TerraDrawCircleMode(),
      new TerraDrawFreehandMode({
        pointerDistance: 5,
        validation: (feature) => {
          return ValidateNotSelfIntersecting(feature);
        },
      }),
    ],
  });
}

export const ensureModeProperty = (features: any[]): GeoJSONStoreFeatures[] => {
  return features.map((feature) => {
    if (feature.properties?.mode) return feature;
    const type = feature.geometry?.type;
    const mode =
      type === "Point"
        ? "point"
        : type === "Polygon"
        ? "polygon"
        : type === "LineString"
        ? "linestring"
        : "unknown";
    return {
      ...feature,
      properties: { ...feature.properties, mode },
    };
  }) as GeoJSONStoreFeatures[];
};

export const filterUserFeatures = (features: GeoJSONStoreFeatures[]) =>
  features.filter(
    (f) =>
      f.geometry.type !== "Point" ||
      (f.properties.mode !== "static" && f.properties.mode !== "select")
  );
export const IconButton = React.forwardRef<HTMLDivElement, any>(
  (props, ref) => (
    <button
      ref={ref}
      type="button"
      className={tw`h-8 px-3 py-2 rounded-md focus:outline-none  cursor-pointer text-md flex align-middle items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100! disabled:opacity-50`}
      {...props}
    />
  )
);

export const MapStyleSwitcher = ({
  currentStyleIdx,
  onStyleChange,
  mapStyles,
}) => (
  <div
    style={{
      position: "absolute",
      left: 12,
      bottom: 12,
      background: "rgba(255,255,255,0.95)",
      padding: "8px",
      borderRadius: "6px",
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    }}
  >
    <select
      value={currentStyleIdx}
      onChange={(e) => onStyleChange(Number(e.target.value))}
      style={{ fontSize: 14, padding: "4px" }}
    >
      {mapStyles.map((style, idx) => (
        <option key={style.key || idx} value={idx}>
          {style.text || `Style ${idx + 1}`}
        </option>
      ))}
    </select>
  </div>
);
