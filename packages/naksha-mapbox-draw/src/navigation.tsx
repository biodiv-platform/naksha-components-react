import React from "react";
import { FullscreenControl, NavigationControl } from "react-map-gl";

interface NavigationProps {
  onViewportChange;
}

export default function Navigation({ onViewportChange }: NavigationProps) {
  return (
    <div className="mapboxgl-ctrl-top-right" style={{ width: "44px" }}>
      <FullscreenControl />
      <NavigationControl onViewportChange={onViewportChange} />
    </div>
  );
}
