import React from "react";

export default function DeletePanel({ onDelete }) {
  return (
    <div className="mapboxgl-ctrl-top-left" style={{ marginTop: "100px" }}>
      <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
        <button
          className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
          title="Delete"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}
