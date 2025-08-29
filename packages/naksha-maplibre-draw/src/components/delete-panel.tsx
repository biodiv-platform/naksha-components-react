import React from "react";

export default function DeletePanel({ onDelete }) {
  return (
    <div className="maplibregl-ctrl-top-left" style={{ marginTop: "100px" }}>
      <div className="maplibregl-ctrl-group maplibregl-ctrl">
        <button
          className="maplibre-gl-draw_ctrl-draw-btn maplibre-gl-draw_trash"
          title="Delete"
          onClick={onDelete}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "30px",
            height: "30px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
