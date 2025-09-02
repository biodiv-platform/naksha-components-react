import React from "react";

import Map from "./components/map";
import { NakshaMaplibreViewProps } from "./interfaces";

export const NakshaMaplibreDraw = (props: NakshaMaplibreViewProps) => (
  <Map {...props} />
);
