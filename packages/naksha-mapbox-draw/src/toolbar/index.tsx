import { ViewMode } from "@nebula.gl/edit-modes";
import React, { useState } from "react";
import {
  DrawLineStringMode,
  DrawPolygonMode,
  DrawRectangleMode,
} from "react-map-gl-draw";

import styled from "@emotion/styled";

const IconButton = styled.button`
  background-image: url("https://geojson.io/lib/draw/images/spritesheet.png");
  background-repeat: no-repeat;
  &[data-selected="true"] {
    background-color: #e7e7e7;
  }
`;

const MODES = [
  { id: "drawPolygon", pos: "-30px -1px", handler: DrawPolygonMode },
  { id: "drawPolyline", pos: "-1px -1px", handler: DrawLineStringMode },
  { id: "drawRectangle", pos: "-60px -1px", handler: DrawRectangleMode },
];

export default function MapboxDrawToolbar({ setMode, clearFeatures }) {
  const [modeId, setModeId] = useState(MODES[0].id);

  const handleOnUpdateViewport = (modeId) => {
    const newMode = MODES.find((mode) => mode.id === modeId);

    if (newMode) {
      setMode(new newMode.handler());
      setModeId(newMode.id);
      return;
    }

    setMode(new ViewMode());
  };

  return (
    <div className="mapboxgl-ctrl-top-left">
      <div className="mapboxgl-ctrl mapboxgl-ctrl-group">
        {MODES.map((mode) => (
          <IconButton
            type="button"
            key={mode.id}
            style={{ backgroundPosition: mode.pos }}
            title={mode.id}
            data-selected={modeId === mode.id}
            onClick={() => handleOnUpdateViewport(mode.id)}
          />
        ))}
        <IconButton
          type="button"
          style={{ backgroundPosition: "-180px -1px" }}
          title="Clear"
          onClick={clearFeatures}
        />
      </div>
    </div>
  );
}
