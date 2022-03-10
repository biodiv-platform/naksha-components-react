import React from "react";
import { MapProvider } from "react-map-gl";

import Map from "./components/map";
import { NakshaMapboxViewProps } from "./interfaces";

export const NakshaMapboxView = (props: NakshaMapboxViewProps) => (
  <MapProvider>
    <Map {...props} />
  </MapProvider>
);
