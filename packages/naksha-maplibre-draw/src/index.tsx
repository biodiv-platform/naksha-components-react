import React from "react";
import { MapProvider } from "react-map-gl/maplibre";

import Map from "./components/map";
import { NakshaMaplibreViewProps } from "./interfaces";

export const NakshaMaplibreDraw = (props: NakshaMaplibreViewProps) => (
  <MapProvider>
    <Map {...props} />
  </MapProvider>
);
